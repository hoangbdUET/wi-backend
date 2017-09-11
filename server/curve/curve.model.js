"use strict";

var models = require('../models');
var config = require('config');
// var Curve = models.Curve;
// var Dataset = models.Dataset;
var exporter = require('./export');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
// var FamilyCondition = models.FamilyCondition;

var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;


function createNewCurve(curveInfo, done,dbConnection) {
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

function editCurve(curveInfo, done,dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            curve.idDataset = curveInfo.idDataset;
            curve.name = curveInfo.name;
            curve.dataset = curveInfo.dataset;
            curve.unit = curveInfo.unit;
            curve.initValue = curveInfo.initValue;
            curve.save()
                .then(() => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", curveInfo));
                })
                .catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.name));
                })
        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for edit"));
        })
}


function getCurveInfo(curve, done,dbConnection) {
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

function copyCurve(param, rs,dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(param.idCurve).then(curve => {
        if (curve) {
            Dataset.findById(curve.idDataset).then(srcDataset => {
                Dataset.findById(param.desDatasetId).then(desDataset => {
                    if (desDataset) {
                        let srcHashPath = hashDir.getHashPath(config.curveBasePath, srcDataset.name + curve.name, curve.name + ".txt");
                        let cp = hashDir.copyFile(config.curveBasePath, srcHashPath, desDataset.name + curve.name, curve.name + ".txt");
                        if (cp) {
                            var newCurve = curve;
                            newCurve.idDataset = desDataset.idDataset;
                            createNewCurve(newCurve, (status) => {
                                rs(status);
                            });
                        } else {
                            rs(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Copy error"));
                        }
                    } else {
                        rs(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Destination dataset not found"));
                    }
                });
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

function moveCurve(param, rs,dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(param.idCurve).then(curve => {
        if (curve) {
            Dataset.findById(curve.idDataset).then(srcDataset => {
                if (srcDataset) {
                    Dataset.findById(param.desDatasetId).then(desDataset => {
                        if (desDataset) {
                            try {
                                let srcHashPath = hashDir.getHashPath(config.curveBasePath, srcDataset.name + curve.name, curve.name + ".txt");
                                hashDir.copyFile(config.curveBasePath, srcHashPath, desDataset.name + curve.name, curve.name + ".txt");

                                curve.idDataset = param.desDatasetId;
                                curve.save().then(() => {
                                    hashDir.deleteFolder(config.curveBasePath, srcDataset.name + curve.name);
                                    rs(ResponseJSON(ErrorCodes.SUCCESS, "Successful"));
                                });

                            } catch (err) {
                                console.log(err);
                                rs(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't move"));
                            }
                        } else {
                            rs(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Destination Dataset not found"));
                        }
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

function deleteCurve(curveInfo, done,dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            if (curve) {
                Dataset.findById(curve.idDataset).then(dataset => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        /*hashDir.createJSONReadStream(config.curveBasePath, dataset.name + curve.name, curve.name + '.txt');*/
                        hashDir.deleteFolder(config.curveBasePath, dataset.name + curve.name);
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

function getData(param, successFunc, errorFunc,dbConnection) {
    //console.log("GET DATA");
    var Curve = dbConnection.Curve;
    Curve.findById(param.idCurve)
        .then(curve => {
            if (curve) {
                Dataset.findById(curve.idDataset).then((dataset) => {
                    //console.log("000000000000000000", dataset.name, curve.name, config.curveBasePath);
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        successFunc(hashDir.createJSONReadStream(config.curveBasePath, dataset.name + curve.name, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n'));
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

function exportData(param, successFunc, errorFunc,dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(param.idCurve)
        .then(function (curve) {
            if (curve) {
                Dataset.findById(curve.idDataset).then((dataset) => {
                    if (!dataset) {
                        console.log("No dataset");
                    } else {
                        exporter.exportData(hashDir.createReadStream(config.curveBasePath, dataset.name + curve.name, curve.name + '.txt'), successFunc);
                        //console.log("Hahahahaha");
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

module.exports = {
    createNewCurve: createNewCurve,
    editCurve: editCurve,
    deleteCurve: deleteCurve,
    getCurveInfo: getCurveInfo,
    getData: getData,
    exportData: exportData,
    copyCurve: copyCurve,
    moveCurve: moveCurve
};

