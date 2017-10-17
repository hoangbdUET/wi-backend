"use strict";

var config = require('config');
// var Curve = models.Curve;
// var Dataset = models.Dataset;
var exporter = require('./export');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var asyncLoop = require('node-async-loop');
// var FamilyCondition = models.FamilyCondition;
var fs = require('fs');

var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;

function createNewCurve(curveInfo, done, dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.sync()
        .then(() => {
                var curve = Curve.build({
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
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
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
                                    var copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
                                    copy.on('close', function () {
                                        hashDir.deleteFolder(config.curveBasePath, username + project.name + well.name + dataset.name + curveName);
                                    });
                                    copy.on('error', function (err) {
                                        return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit Curve name", err));
                                    });
                                    curve.idDataset = curveInfo.idDataset;
                                    curve.name = curveInfo.name;
                                    curve.dataset = curveInfo.dataset;
                                    curve.unit = curveInfo.unit;
                                    curve.initValue = curveInfo.initValue;
                                    curve.save()
                                        .then(() => {
                                            done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
                                        })
                                        .catch(err => {
                                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.name));
                                        })
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
                                asyncLoop(lines, function (line, next) {
                                    line.minValue = family.minScale;
                                    line.maxValue = family.maxScale;
                                    line.unit = rs.unit;
                                    Object.assign(line, line).save();
                                    next();
                                }, function (err) {
                                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
                                });
                            }).catch(err => {
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.meesage));
                            });
                        }).catch(err => {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.meesage));
                        });
                    })
                    .catch(err => {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.name));
                    })
            }

        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for edit"));
        })
}


function getCurveInfo(curve, done, dbConnection, username) {
    var Curve = dbConnection.Curve;
    Curve.findById(curve.idCurve, {include: [{all: true}]})
        .then(curve => {
            if (!curve) throw "not exits";
            if (!curve.idFamily) {
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
                            "minScale": result.minScale,
                            "maxScale": result.maxScale,
                            "displayType": "Linear",
                            "displayMode": "Line",
                            "blockPosition": "NONE",
                            "lineStyle": "[0]",
                            "lineWidth": 1,
                            "lineColor": "fuchsia",
                        }
                    }
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
                });
            } else {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
            }
        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for get info"));
        });
}

///curve advance acrions

function copyCurve(param, done, dbConnection, username) {
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
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
                                        var newCurve = curve.toJSON();
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
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
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
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
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
                                done(ResponseJSON(ErrorCodes.SUCCESS, "Curve is deleted", curve));
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

///curve advance acrions end

function getData(param, successFunc, errorFunc, dbConnection, username) {
    //console.log("GET DATA");
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
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
                                    //console.log("helo");
                                    successFunc(hashDir.createJSONReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n'));
                                });
                            }
                        });
                    }
                }).catch(err => {
                    errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset for curve not found"));
                });
            } else {

            }
            //successFunc( hashDir.createJSONReadStream(config.curveBasePath, curve.dataset + curve.name, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n') );
        })
        .catch((err) => {
            console.log(err);
            errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
        });
}

function exportData(param, successFunc, errorFunc, dbConnection, username) {
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
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
                                    //console.log(project.name + well.name + dataset.name + curve.name);
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
}

function updateData(req, result) {
    var dbConnection = req.dbConnection;
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
    let isBackup = req.body.isBackup;
    let idDataset = req.body.idDataset;
    let name = req.body.name;
    let unit = req.body.unit;
    let file = req.file;
    Curve.findOne({where: {idDataset: idDataset, name: name}}).then(curve => {
        if (!curve) {
            //create new curve
            let curveInfo = new Object();
            curveInfo.name = name;
            curveInfo.idDataset = idDataset;
            curveInfo.initValue = "abc";
            curveInfo.unit = unit;
            Curve.create(curveInfo).then(rs => {
                Dataset.findById(idDataset).then(dataset => {
                    let path = hashDir.createPath(config.curveBasePath, dataset.name + rs.name, rs.name + '.txt');
                    fs.createReadStream(file.path).pipe(fs.createWriteStream(path));
                    fs.unlink(file.path);
                    return result(ResponseJSON(ErrorCodes.SUCCESS, "CREATED NEW CURVE", rs));
                });
            }).catch(err => {
                return result(ResponseJSON(ErrorCodes.SUCCESS, "CREATED NEW CURVE ERR", err));
                console.log(err);
            });
        } else {
            //found curve
            if (isBackup == "true") {
                let curveInfo = new Object();
                curveInfo.name = curve.name + "_Backup";
                curveInfo.unit = curve.unit;
                curveInfo.idDataset = curve.idDataset;
                curveInfo.initValue = curve.initValue;
                Curve.create(curveInfo).then(rs => {
                    Dataset.findById(idDataset).then(dataset => {
                        let backupPath = hashDir.createPath(config.curveBasePath, dataset.name, rs.name + '.txt');
                        let oldPath = hashDir.createPath(config.curveBasePath, dataset.name + curve.name, curve.name + '.txt');
                        fs.createReadStream(oldPath).pipe(fs.createWriteStream(backupPath));
                        fs.createReadStream(file.path).pipe(fs.createWriteStream(oldPath));
                        fs.unlink(file.path);
                        return result(ResponseJSON(ErrorCodes.SUCCESS, "EDITED OLD CURVE AND CREATED BACKUP CURVE", rs));
                    });
                }).catch(err => {
                    console.log(err);
                    return result(ResponseJSON(ErrorCodes.SUCCESS, "SOME ERROR", err));
                });
            } else if (isBackup == "false") {
                //overide
                //console.log("OVERIDE");
                Dataset.findById(idDataset).then(dataset => {
                    let path = hashDir.createPath(config.curveBasePath, dataset.name + name, name + '.txt');
                    fs.createReadStream(file.path).pipe(fs.createWriteStream(path));
                    return result(ResponseJSON(ErrorCodes.SUCCESS, "OVERIDE CURVE SUCCESSFUL"));
                });
            } else {

            }
        }
    }).catch(err => {
        console.log(err);
        return result(ResponseJSON(ErrorCodes.SUCCESS, "ERROR", err));
    });
}

let getScale = function (req, done, dbConnection) {
    calculateScale(req.body.idCurve, req.decoded.username, dbConnection, function (err, result) {
        if (err) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "min max curve success", result));
        }
    });
}
let calculateScale = function (idCurve, username, dbConnection, callback) {
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Project = dbConnection.Project;
    var Well = dbConnection.Well;
    Curve.findById(idCurve)
        .then(function (curve) {
            if (curve) {
                Dataset.findById(curve.idDataset).then((dataset) => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        Well.findById(dataset.idWell).then(well => {
                            if (well) {
                                Project.findById(well.idProject).then(project => {
                                    let inputStream = hashDir.createReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                    // if (inputStream.bytesRead == 0) {
                                    //     return callback('No File', null);
                                    // }
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
                                        arrY.push(arrXY[0]);
                                    });

                                    lineReader.on('close', function () {
                                        //console.log(arrY);
                                        let min = 99999;
                                        let max = 0;
                                        arrY.forEach(function (element, i) {
                                            if (element != 'null') {
                                                element = parseFloat(element);
                                                if (element < min) min = element;
                                                if (element > max) max = element;
                                            }
                                        });
                                        callback(null, {minScale: min, maxScale: max});
                                        // res.send(ResponseJSON(ErrorCodes.SUCCESS, "min max curve success", {
                                        //     minScale: min,
                                        //     maxScale: max
                                        // }));
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

            }

        })
        .catch(function (err) {
            callback(err, null)
        })
}
module.exports = {
    createNewCurve: createNewCurve,
    editCurve: editCurve,
    deleteCurve: deleteCurve,
    getCurveInfo: getCurveInfo,
    getData: getData,
    exportData: exportData,
    copyCurve: copyCurve,
    moveCurve: moveCurve,
    updateData: updateData,
    getScale: getScale,
    calculateScale: calculateScale
};

