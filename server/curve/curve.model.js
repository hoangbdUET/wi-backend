"use strict";

var config = require('config');
// var Curve = models.Curve;
// var Dataset = models.Dataset;
var exporter = require('./export');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
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
    //console.log(curveInfo);
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            if (curve.name != curveInfo.name) {
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
            } else {
                console.log("EDIT CURVE");
                Object.assign(curve, curveInfo)
                    .save()
                    .then(() => {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
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


function getCurveInfo(curve, done, dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(curve.idCurve, {include: [{all: true}]})
        .then(curve => {
            if (!curve) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
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
                                        Curve.create(newCurve).then(cu => {
                                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", {idCurve: cu.idCurve}))
                                        }).catch(err => {
                                            console.log(err);
                                        });
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
                                            curve.save().then(() => {
                                                hashDir.deleteFolder(config.curveBasePath, username + srcProject.name + srcWell.name + srcDataset.name + curve.name);
                                                rs(ResponseJSON(ErrorCodes.SUCCESS, "Successful"));
                                            });

                                        } catch (err) {
                                            console.log(err);
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

module.exports = {
    createNewCurve: createNewCurve,
    editCurve: editCurve,
    deleteCurve: deleteCurve,
    getCurveInfo: getCurveInfo,
    getData: getData,
    exportData: exportData,
    copyCurve: copyCurve,
    moveCurve: moveCurve,
    updateData: updateData
};

