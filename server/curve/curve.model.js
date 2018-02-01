"use strict";

let config = require('config');
let exporter = require('./export');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncLoop = require('async/each');
let fs = require('fs-extra');
let request = require('request');

let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;

function createNewCurve(curveInfo, done, dbConnection) {
    let Curve = dbConnection.Curve;
    Curve.sync()
        .then(() => {
                let curve = Curve.build({
                    idDataset: curveInfo.idDataset,
                    name: curveInfo.name,
                    dataset: curveInfo.dataset,
                    unit: curveInfo.unit,
                    initValue: curveInfo.initValue
                });
                curve.save()
                    .then(curve => {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", {idCurve: curve.idCurve}))
                    })
                    .catch(err => {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Curve " + err));
                    });
            },
            () => {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}

function editCurve(curveInfo, done, dbConnection, username) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Project = dbConnection.Project;
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            if (curve.name != curveInfo.name) {
                console.log(curve.name, "-", curveInfo.name);
                Curve.findOne({
                    where: {
                        idDataset: curve.idDataset,
                        name: curveInfo.name
                    }
                }).then(foundCurve => {
                    if (foundCurve) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve name existed!"));
                    } else {
                        console.log("EDIT CURVE NAME");
                        Dataset.findById(curve.idDataset).then(dataset => {
                            Well.findById(dataset.idWell).then(well => {
                                Project.findById(well.idProject).then(project => {
                                    let curveName = curve.name;
                                    let path = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curveName, curveName + '.txt');
                                    let newPath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curveInfo.name, curveInfo.name + '.txt');
                                    let copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
                                    copy.on('close', function () {
                                        hashDir.deleteFolder(config.curveBasePath, username + project.name + well.name + dataset.name + curveName);
                                    });
                                    copy.on('error', function (err) {
                                        return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit Curve name", err));
                                    });
                                    curve.idDataset = curveInfo.idDataset ? curveInfo.idDataset : curve.idDataset;
                                    curve.name = curveInfo.name;
                                    curve.unit = curveInfo.unit ? curveInfo.unit : curve.unit;
                                    curve.initValue = curveInfo.initValue ? curveInfo.initValue : curve.initValue;
                                    curve.save()
                                        .then(() => {
                                            done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
                                        })
                                        .catch(err => {
                                            if (err.name === "SequelizeUniqueConstraintError") {
                                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve existed!"));
                                            } else {
                                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                                            }
                                        });
                                });
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }).catch(err => {

                })
            } else {
                console.log("EDIT CURVE");
                Object.assign(curve, curveInfo)
                    .save()
                    .then((rs) => {
                        let Family = dbConnection.Family;
                        Family.findById(rs.idFamily).then(family => {
                            let Line = dbConnection.Line;
                            Line.findAll({where: {idCurve: rs.idCurve}}).then(lines => {
                                if (lines.length > 0) {
                                    asyncLoop(lines, function (line, next) {
                                        line.minValue = family.minScale;
                                        line.maxValue = family.maxScale;
                                        line.unit = rs.unit;
                                        Object.assign(line, line).save();
                                        next();
                                    }, function (err) {
                                        done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
                                    });
                                } else {
                                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
                                }
                            }).catch(err => {
                                console.log(err);
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.meesage));
                            });
                        }).catch(err => {
                            console.log(err);
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.meesage));
                        });
                    })
                    .catch(err => {
                        if (err.name === "SequelizeUniqueConstraintError") {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve existed!"));
                        } else {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                        }
                    })
            }

        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for edit"));
        })
}


function getCurveInfo(curve, done, dbConnection, username) {
    let Curve = dbConnection.Curve;
    Curve.findById(curve.idCurve, {
        include: {
            model: dbConnection.Family,
            as: 'LineProperty',
            include: {
                model: dbConnection.FamilySpec,
                as: 'family_spec',
                where: {isDefault: true}
            }
        }
    })
        .then(curve => {
            if (!curve) throw "not exits";
            if (!curve.idFamily) {
                console.log("No Family");
                calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
                    curve = curve.toJSON();
                    if (err) {
                        curve.LineProperty = {
                            name: "Khong tinh duoc :(((",
                            minScale: 0,
                            maxScale: 200
                        }
                    } else {
                        curve.LineProperty = {
                            "idFamily": null,
                            "name": null,
                            "familyGroup": null,
                            "unit": null,
                            "minScale": parseFloat(result.minScale),
                            "maxScale": parseFloat(result.maxScale),
                            "displayType": "Linear",
                            "displayMode": "Line",
                            "blockPosition": "NONE",
                            "lineStyle": "[0]",
                            "lineWidth": 1,
                            "lineColor": "red",
                        }
                    }
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
                });
            } else {
                let curveObj = curve.toJSON();
                curveObj.LineProperty.blockPosition = curveObj.LineProperty.family_spec[0].blockPosition;
                curveObj.LineProperty.displayMode = curveObj.LineProperty.family_spec[0].displayMode;
                curveObj.LineProperty.displayType = curveObj.LineProperty.family_spec[0].displayType;
                curveObj.LineProperty.lineColor = curveObj.LineProperty.family_spec[0].lineColor;
                curveObj.LineProperty.lineStyle = curveObj.LineProperty.family_spec[0].lineStyle;
                curveObj.LineProperty.lineWidth = curveObj.LineProperty.family_spec[0].lineWidth;
                curveObj.LineProperty.maxScale = curveObj.LineProperty.family_spec[0].maxScale;
                curveObj.LineProperty.minScale = curveObj.LineProperty.family_spec[0].minScale;
                curveObj.LineProperty.unit = curveObj.LineProperty.family_spec[0].unit;
                delete curveObj.LineProperty.family_spec;
                done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curveObj));
            }
        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for get info"));
        });
}

///curve advance acrions

function copyCurve(param, done, dbConnection, username) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Project = dbConnection.Project;
    Curve.findById(param.idCurve).then(curve => {
        if (curve) {
            Dataset.findById(curve.idDataset).then(srcDataset => {
                Well.findById(srcDataset.idWell).then(srcWell => {
                    Project.findById(srcWell.idProject).then(srcProject => {
                        Dataset.findById(param.desDatasetId).then(desDataset => {
                            if (desDataset) {
                                Well.findById(desDataset.idWell).then(desWell => {
                                    let srcHashPath = hashDir.getHashPath(config.curveBasePath, username + srcProject.name + srcWell.name + srcDataset.name + curve.name, curve.name + ".txt");
                                    console.log("SRC : " + srcHashPath);
                                    let cp = hashDir.copyFile(config.curveBasePath, srcHashPath, username + srcProject.name + desWell.name + desDataset.name + curve.name, curve.name + ".txt");
                                    console.log("CP : " + cp);
                                    if (cp) {
                                        let newCurve = curve.toJSON();
                                        newCurve.idDataset = desDataset.idDataset;
                                        delete newCurve.idCurve;
                                        //console.log("New Curve : " + JSON.stringify(newCurve));
                                        Curve.findAll({
                                            where: {
                                                idDataset: desDataset.idDataset,
                                                name: newCurve.name
                                            }
                                        }).then(c => {
                                            if (c.length > 0) {
                                                Curve.destroy({
                                                    where: {
                                                        idCurve: c[0].idCurve
                                                    }
                                                }).then(rs => {
                                                    Curve.create(newCurve).then(cu => {
                                                        done(ResponseJSON(ErrorCodes.SUCCESS, "Copy and Override Curve success", {idCurve: cu.idCurve}))
                                                    }).catch(err => {
                                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Copy err", err))
                                                    });
                                                }).catch((err) => {
                                                    console.log("ERRRRRR");
                                                })
                                            } else {
                                                Curve.create(newCurve).then(cu => {
                                                    done(ResponseJSON(ErrorCodes.SUCCESS, "Copy Curve success", {idCurve: cu.idCurve}))
                                                }).catch(err => {
                                                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Copy err", err))
                                                });
                                            }
                                        }).catch(err => {

                                        })

                                    } else {
                                        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Copy error"));
                                    }
                                });
                            } else {
                                done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Destination dataset not found"));
                            }
                        });
                    });
                });

            }).catch(err => {
                console.log(err.stack);
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
        }
    }).catch(err => {
        console.log(err.stack);
    });

}

function moveCurve(param, rs, dbConnection, username) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Project = dbConnection.Project;
    Curve.findById(param.idCurve).then(curve => {
        if (curve) {
            Dataset.findById(curve.idDataset).then(srcDataset => {
                if (srcDataset) {
                    Well.findById(srcDataset.idWell).then(srcWell => {
                        Project.findById(srcWell.idProject).then(srcProject => {
                            Dataset.findById(param.desDatasetId).then(desDataset => {
                                if (desDataset) {
                                    Well.findById(desDataset.idWell).then(desWell => {
                                        try {
                                            let srcHashPath = hashDir.getHashPath(config.curveBasePath, username + srcProject.name + srcWell.name + srcDataset.name + curve.name, curve.name + ".txt");
                                            hashDir.copyFile(config.curveBasePath, srcHashPath, username + srcProject.name + desWell.name + desDataset.name + curve.name, curve.name + ".txt");
                                            curve.idDataset = param.desDatasetId;
                                            Curve.findAll({
                                                where: {
                                                    idDataset: param.desDatasetId,
                                                    name: curve.name
                                                }
                                            }).then(c => {
                                                if (c.length > 0) {
                                                    Curve.destroy({
                                                        where: {
                                                            idCurve: c[0].idCurve
                                                        }
                                                    }).then(() => {
                                                        curve.save().then(() => {
                                                            hashDir.deleteFolder(config.curveBasePath, username + srcProject.name + srcWell.name + srcDataset.name + curve.name);
                                                            rs(ResponseJSON(ErrorCodes.SUCCESS, "Successful"));
                                                        }).catch(err => {
                                                            rs(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "FAILE", err));
                                                        });
                                                    });
                                                } else {
                                                    curve.save().then(() => {
                                                        hashDir.deleteFolder(config.curveBasePath, username + srcProject.name + srcWell.name + srcDataset.name + curve.name);
                                                        rs(ResponseJSON(ErrorCodes.SUCCESS, "Successful"));
                                                    }).catch(err => {
                                                        rs(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "FAILE", err));
                                                    });
                                                }
                                            }).catch();


                                        } catch (err) {
                                            // console.log(err);
                                            rs(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't move"));
                                        }
                                    });
                                } else {
                                    rs(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Destination Dataset not found"));
                                }
                            });
                        });
                    });

                }
            }).catch(err => {
                console.log(err.stack);
            });
        } else {
            rs(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
        }
    }).catch(err => {
        console.log(err.stack);
    });
}

function deleteCurve(curveInfo, done, dbConnection, username) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            if (curve) {
                Dataset.findById(curve.idDataset).then(dataset => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        /*hashDir.createJSONReadStream(config.curveBasePath, dataset.name + curve.name, curve.name + '.txt');*/
                        curve.destroy()
                            .then(() => {
                                dbConnection.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
                                    asyncLoop(lines, function (line, next) {
                                        line.destroy().then(() => {
                                            next();
                                        });
                                    }, function () {
                                        done(ResponseJSON(ErrorCodes.SUCCESS, "Curve is deleted", curve));
                                    })
                                })
                            })
                            .catch(err => {
                                done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Curve " + err.errors[0].message));
                            })
                    }
                }).catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Error while delete curve : " + err.message));
                    console.log(err.stack);
                });
            }

        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for delete"));
        })
}


function getData(param, successFunc, errorFunc, dbConnection, username) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Project = dbConnection.Project;
    Curve.findById(param.idCurve)
        .then(curve => {
            if (curve) {
                Dataset.findById(curve.idDataset).then((dataset) => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        Well.findById(dataset.idWell).then(well => {
                            if (well) {
                                Project.findById(well.idProject).then(project => {
                                    successFunc(hashDir.createJSONReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n'));
                                });
                            }
                        });
                    }
                }).catch(err => {
                    errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset for curve not found"));
                });
            } else {
                errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
            }
        })
        .catch((err) => {
            console.log(err);
            errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
        });
}

function exportData(param, successFunc, errorFunc, dbConnection, username) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Project = dbConnection.Project;
    Curve.findById(param.idCurve)
        .then(function (curve) {
            if (curve) {
                Dataset.findById(curve.idDataset).then((dataset) => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        Well.findById(dataset.idWell).then(well => {
                            if (well) {
                                Project.findById(well.idProject).then(project => {
                                    exporter.exportData(hashDir.createReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt'), successFunc);
                                });
                            }
                        });

                    }
                }).catch(err => {
                    errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset for curve not found"));
                });

            } else {

            }

        })
        .catch(function () {
            errorFunc(404);
        })
};

let getScale = function (req, done, dbConnection) {
    // dbConnection.Curve.findById(req.body.idCurve).then(curve => {
    //     dbConnection.FamilyCondition.findAll()
    //         .then(conditions => {
    //             let result = conditions.find(function (aCondition) {
    //                 let regex;
    //                 try {
    //                     // console.log(curve.name + "id: " + aCondition.idFamilyCondition + " curveName: " + aCondition.curveName + " unit: " + aCondition.unit);
    //                     regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curve.name) && new RegExp("^" + aCondition.unit + "$", "i").test(curve.unit);
    //                     if (regex) console.log("=====", curve.name + "id: " + aCondition.idFamilyCondition + " curveName: " + aCondition.curveName + " unit: " + aCondition.unit);
    //                 } catch (err) {
    //                     console.log(err);
    //                 }
    //                 return regex;
    //             });
    //             console.log("RESULT ", result ? result.idFamilyCondition : "Null");
    //             if (!result) {
    //                 done(ResponseJSON(ErrorCodes.SUCCESS, "min max curve success", {
    //                     minScale: 0,
    //                     maxScale: 100,
    //                     meanValue: 50
    //                 }));
    //                 return;
    //             }
    //             result.getFamily()
    //                 .then(aFamily => {
    //                     curve.setLineProperty(aFamily);
    //                 });
    //             done(ResponseJSON(ErrorCodes.SUCCESS, "min max curve success", {
    //                 minScale: 0,
    //                 maxScale: 100,
    //                 meanValue: 50
    //             }));
    //         })
    // });
    calculateScale(req.body.idCurve, req.decoded.username, dbConnection, function (err, result) {
        if (err) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "min max curve success", result));
        }
    });
};

let calculateScale = function (idCurve, username, dbConnection, callback) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Project = dbConnection.Project;
    let Well = dbConnection.Well;
    Curve.findById(idCurve, {paranoid: false})
        .then(function (curve) {
            if (curve) {
                Dataset.findById(curve.idDataset, {paranoid: false}).then((dataset) => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        Well.findById(dataset.idWell, {paranoid: false}).then(well => {
                            if (well) {
                                Project.findById(well.idProject, {paranoid: false}).then(project => {
                                    let inputStream = hashDir.createReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                    let lineReader = require('readline').createInterface({
                                        input: inputStream
                                    });
                                    lineReader.on('error', function (err) {
                                        console.log("LOI NA");
                                        lineReader.close();
                                    })
                                    let arrY = [];
                                    lineReader.on('line', function (line) {
                                        let arrXY = line.split(/\s+/g).slice(1, 2);
                                        if (arrXY[0] != 'null') {
                                            arrY.push(arrXY[0]);
                                        }
                                    });

                                    lineReader.on('close', function () {
                                        //console.log(arrY);
                                        let min = parseFloat(arrY[0]);
                                        let max = parseFloat(arrY[0]);
                                        let sum = 0;
                                        arrY.forEach(function (element, i) {
                                            if (element != 'null') {
                                                element = parseFloat(element);
                                                sum += element;
                                                if (element < min) min = element;
                                                if (element > max) max = element;
                                            }
                                        });
                                        callback(null, {minScale: min, maxScale: max, meanValue: sum / arrY.length});
                                    });
                                }).catch(err => {
                                    console.log("LOI");
                                });
                            }
                        });

                    }
                }).catch(err => {
                    callback(err, null);
                });

            } else {
                console.log("No curve");
            }

        })
        .catch(function (err) {
            callback(err, null)
        })
}

let processingCurve = function (req, done, dbConnection) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Project = dbConnection.Project;
    let Line = dbConnection.Line;
    let Histogram = dbConnection.Histogram;
    let CrossPlot = dbConnection.CrossPlot;
    let PointSet = dbConnection.PointSet;
    let idDataset = req.body.idDataset;
    let filePath = req.tmpPath;
    let newCurveName = req.body.curveName;
    let unit = req.body.unit ? req.body.unit : "US/F";
    let idFamily = req.body.idFamily ? (req.body.idFamily == 'null' ? null : req.body.idFamily) : null;
    let idDesCurve = req.body.idDesCurve;
    Dataset.findById(idDataset).then(dataset => {
        if (dataset) {
            Well.findById(dataset.idWell).then(well => {
                Project.findById(well.idProject).then(project => {
                    if (newCurveName && newCurveName != 'null') {
                        //create new curve
                        Curve.create({
                            name: newCurveName,
                            unit: unit,
                            initValue: "abc",
                            idDataset: idDataset,
                            idFamily: idFamily
                        }).then(curve => {
                            let newPath = hashDir.createPath(config.curveBasePath, req.decoded.username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                            fs.copy(filePath, newPath, function (err) {
                                if (err) {
                                    console.log("ERR COPY FILE : ", err);
                                }
                                console.log("Copy file success!");
                                fs.unlink(filePath);
                                done(ResponseJSON(ErrorCodes.SUCCESS, "Success", curve));
                            });
                        }).catch(err => {
                            fs.unlink(filePath);
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve existed"));
                        });
                    } else {
                        //overwrite curve
                        Curve.findById(idDesCurve).then(curve => {
                            if (curve) {
                                let response = new Object();
                                response.lines = new Array();
                                response.histograms = new Array();
                                response.pointsets = new Array();
                                let newPath = hashDir.createPath(config.curveBasePath, req.decoded.username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                fs.copy(filePath, newPath, function (err) {
                                    if (err) {
                                        console.log("ERR COPY FILE : ", err);
                                    }
                                    console.log("Copy file success!");
                                    fs.unlink(filePath);
                                    Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
                                        asyncLoop(lines, function (line, next) {
                                            if (line) {
                                                let lineInfo = line.toJSON();
                                                lineInfo.idCurve = curve.idCurve;
                                                lineInfo.unit = curve.unit;
                                                Object.assign(line, lineInfo).save().then(rs => {
                                                    response.lines.push(line);
                                                    next();
                                                }).catch(err => {
                                                    console.log(err);
                                                    next();
                                                });
                                            } else {
                                                next();
                                            }
                                        }, function () {
                                            Histogram.findAll({where: {idCurve: parseInt(curve.idCurve)}}).then(histograms => {
                                                asyncLoop(histograms, function (histogram, next) {
                                                    if (histogram) {
                                                        response.histograms.push(histogram.toJSON());
                                                        next();
                                                    } else {
                                                        next();
                                                    }
                                                }, function () {
                                                    let Sequelize = require('sequelize');
                                                    PointSet.findAll({
                                                        where: Sequelize.or(
                                                            {idCurveX: curve.idCurve},
                                                            {idCurveY: curve.idCurve},
                                                            {idCurveZ: curve.idCurve}
                                                        )
                                                    }).then(crossplots => {
                                                        asyncLoop(crossplots, function (crossplot, next) {
                                                            if (crossplot) {
                                                                response.pointsets.push(crossplot.toJSON());
                                                                next();
                                                            } else {
                                                                next();
                                                            }
                                                        }, function () {
                                                            done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", response));
                                                        });
                                                    });
                                                });
                                            })
                                        });
                                    });
                                });
                            } else {
                                fs.unlink(filePath);
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve not existed"));
                            }
                        });
                    }
                });
            })
        } else {
            console.log("No dataset");
            fs.unlink(filePath);
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Dataset"));
        }
    }).catch();
}

async function getCurveDataFromInventory(curveInfo, token, callback, dbConnection, username) {
    let options = {
        method: 'POST',
        url: 'http://' + config.Service.inventory + '/user/well/dataset/curve/data',
        headers:
            {
                Authorization: token,
                'Content-Type': 'application/json'
            },
        body: {idCurve: curveInfo.idInvCurve},
        json: true
    };
    let idDataset = curveInfo.idDesDataset;
    let dataset = await dbConnection.Dataset.findById(idDataset);
    let well = await dbConnection.Well.findById(dataset.idWell);
    let project = await dbConnection.Project.findById(well.idProject);
    let curve = {};
    curve.name = curveInfo.name;
    curve.unit = curveInfo.unit;
    curve.initValue = 0;
    curve.idDataset = dataset.idDataset;
    dbConnection.Curve.findOrCreate({
        where: {
            name: curve.name,
            idDataset: curve.idDataset
        },
        defaults: {
            name: curve.name,
            idDataset: curve.idDataset,
            initValue: curve.initValue,
            unit: curve.unit
        }
    }).then(rs => {
        // console.log(rs);
        let _curve = rs[0];
        let curvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, _curve.name + '.txt');
        console.log(curvePath);
        try {
            let stream = request(options).pipe(fs.createWriteStream(curvePath));
            stream.on('close', function () {
                callback(null, _curve);
            });
            stream.on('error', function (err) {
                callback(err, null);
            });
        } catch (err) {
            callback(err, null);
        }
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}

function duplicateCurve(data, done, dbConnection, username) {
    dbConnection.Curve.findById(data.idCurve).then(async curve => {
        if (curve) {
            try {
                let dataset = await dbConnection.Dataset.findById(curve.idDataset);
                let well = await dbConnection.Well.findById(dataset.idWell);
                let project = await dbConnection.Project.findById(well.idProject);
                let curvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                let newCurve = curve.toJSON();
                newCurve.name = curve.name + '_Copy_' + curve.duplicated;
                delete newCurve.idCurve;
                curve.duplicated += 1;
                await curve.save();
                dbConnection.Curve.create(newCurve).then(_Curve => {
                    let newCurvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _Curve.name, _Curve.name + '.txt');
                    fs.copy(curvePath, newCurvePath, function (err) {
                        if (err) {
                            throw err;
                        }
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", _Curve));
                    });

                }).catch(err => {
                    console.log(err);
                    throw err;
                })
            } catch (err) {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err : " + err.message, err))
            }
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by ID"));
        }
    });
};

module.exports = {
    createNewCurve: createNewCurve,
    editCurve: editCurve,
    deleteCurve: deleteCurve,
    getCurveInfo: getCurveInfo,
    getData: getData,
    exportData: exportData,
    copyCurve: copyCurve,
    moveCurve: moveCurve,
    getScale: getScale,
    calculateScale: calculateScale,
    processingCurve: processingCurve,
    getCurveDataFromInventory: getCurveDataFromInventory,
    duplicateCurve: duplicateCurve
};

