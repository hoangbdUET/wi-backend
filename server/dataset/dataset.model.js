"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let config = require('config');
let fs = require('fs');
let asyncEach = require('async/each');

function createNewDataset(datasetInfo, done, dbConnection) {
    let Dataset = dbConnection.Dataset;
    Dataset.sync()
        .then(function () {
                let dataset = Dataset.build({
                    idWell: datasetInfo.idWell,
                    name: datasetInfo.name,
                    step: datasetInfo.step,
                    top: datasetInfo.top,
                    bottom: datasetInfo.bottom,
                    unit: datasetInfo.unit,
                    datasetKey: datasetInfo.datasetKey,
                    datasetLabel: datasetInfo.datasetLabel,
                    createdBy: datasetInfo.createdBy,
                    updatedBy: datasetInfo.updatedBy
                });
                dataset.save()
                    .then(function (dataset) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Dataset success", dataset));
                    })
                    .catch(function (err) {
                        console.log(err);
                        if (err.name === "SequelizeUniqueConstraintError") {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Dataset's name already exists"));
                        } else {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                        }
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        );
}

function editDataset(datasetInfo, done, dbConnection, username) {
    delete datasetInfo.createdBy;
    dbConnection.Dataset.findById(datasetInfo.idDataset).then(dataset => {
        if (dataset) {
            if (datasetInfo.name && dataset.name != datasetInfo.name) {
                let datasetname = dataset.name;
                dataset.name = datasetInfo.name;
                dataset.datasetKey = datasetInfo.datasetKey;
                dataset.datasetLabel = datasetInfo.datasetLabel;
                dataset.updatedBy = datasetInfo.updatedBy;
                dataset.save().then(() => {
                    dbConnection.Well.findById(dataset.idWell).then(well => {
                        dbConnection.Project.findById(well.idProject).then(project => {
                            dbConnection.Curve.findAll({
                                where: {idDataset: datasetInfo.idDataset},
                                paranoid: false
                            }).then(curves => {
                                asyncEach(curves, function (curve, next) {
                                    let path = hashDir.createPath(config.curveBasePath, username + project.name + well.name + datasetname + curve.name, curve.name + '.txt');
                                    let newPath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + datasetInfo.name + curve.name, curve.name + '.txt');
                                    let copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
                                    copy.on('close', function () {
                                        hashDir.deleteFolder(config.curveBasePath, username + project.name + well.name + datasetname + curve.name);
                                        next();
                                    });
                                    copy.on('error', function (err) {
                                        next(err);
                                    });
                                }, function (err) {
                                    if (err) {
                                        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
                                    }
                                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", dataset));
                                });
                            });
                        });
                    }).catch(err => {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
                    });
                }).catch(err => {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Dataset's name already exists"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                });
            } else {
                Object.assign(dataset, datasetInfo).save().then((d => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", d));
                }))
            }
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No dataset found!"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function deleteDataset(datasetInfo, done, dbConnection) {
    let Dataset = dbConnection.Dataset;
    Dataset.findById(datasetInfo.idDataset, {include: {all: true}})
        .then(function (dataset) {
            dataset.setDataValue('updatedBy', datasetInfo.updatedBy);
            dataset.destroy({permanently: true, force: true})
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Dataset is deleted", dataset));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                });
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for delete"));
        });
}

function getDatasetInfo(dataset, done, dbConnection) {
    let Dataset = dbConnection.Dataset;
    Dataset.findById(dataset.idDataset, {include: [{all: true}]})
        .then(function (dataset) {
            if (!dataset) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Dataset success", dataset));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for get info"));
        });
}

function duplicateDataset(data, done, dbConnection, username) {
    let fsExtra = require('fs-extra');
    dbConnection.Dataset.findById(data.idDataset, {include: {all: true}}).then(async dataset => {
        let well = await dbConnection.Well.findById(dataset.idWell);
        let project = await dbConnection.Project.findById(well.idProject);
        let newDataset = dataset.toJSON();
        delete newDataset.idDataset;
        newDataset.name = dataset.name + '_COPY_' + dataset.duplicated;
        newDataset.step = dataset.step;
        newDataset.top = dataset.top;
        newDataset.bottom = dataset.bottom;
        newDataset.unit = dataset.unit;
        newDataset.createdBy = data.createdBy;
        newDataset.updatedBy = data.updatedBy;
        dataset.duplicated++;
        await dataset.save();
        dbConnection.Dataset.create(newDataset).then(_dataset => {
            asyncEach(dataset.dataset_params, function (dataset_param, nextDatasetParam) {
                dbConnection.DatasetParams.create({
                    mnem: dataset_param.mnem,
                    value: dataset_param.value,
                    unit: dataset_param.unit,
                    description: dataset_param.description,
                    idDataset: _dataset.idDataset
                }).then(() => {
                    nextDatasetParam();
                }).catch(err => {
                    console.log(err);
                    nextDatasetParam();
                });
            }, function () {
                asyncEach(newDataset.curves, function (curve, next) {
                    if (curve.name === '__MD') {
                        next();
                    } else {
                        let curvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                        let newCurvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + _dataset.name + curve.name, curve.name + '.txt');
                        delete curve.idCurve;
                        curve.idDataset = _dataset.idDataset;
                        dbConnection.Curve.create({
                            name: curve.name,
                            unit: curve.unit,
                            idFamily: curve.idFamily,
                            idDataset: _dataset.idDataset,
                            createdBy: data.createdBy,
                            updatedBy: data.updatedBy
                        }).then(c => {
                            fsExtra.copy(curvePath, newCurvePath, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                next();
                            });
                        }).catch(err => {
                            console.log(err);
                            next();
                        });
                    }
                }, function (err) {
                    if (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
                    }
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", _dataset));
                });
            });
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        });
    });
}

function getDatasetInfoByName(dataset, done, dbConnection) {
    let Dataset = dbConnection.Dataset;
    Dataset.findOne({
        where: {
            name: dataset.name,
            idWell: dataset.idWell
        },
        include: [{all: true}]
    }).then(function (dataset) {
        if (!dataset) throw "not exist";
        done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Dataset success", dataset));
    }).catch(function () {
        done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for get info"));
    });
}

function updateDatasetParams(payload, done, dbConnection) {
    let response = [];
    if (payload.idDatasetParam) {
        dbConnection.DatasetParams.findById(payload.idDatasetParam).then(p => {
            Object.assign(p, payload).save().then(r => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        });
    } else {
        dbConnection.Dataset.findById(payload.idDataset).then(dataset => {
            if (dataset) {
                asyncEach(payload.params, function (param, next) {
                    dbConnection.DatasetParams.findOrCreate({
                        where: {
                            idDataset: dataset.idDataset,
                            mnem: param.mnem
                        },
                        defaults: {
                            idDataset: dataset.idDataset,
                            mnem: param.mnem,
                            unit: param.unit,
                            value: param.value,
                            description: param.description
                        }
                    }).then(rs => {
                        if (rs[1]) {
                            //create
                            response.push({param: param, result: "CREATED"});
                            next();
                        } else {
                            //found
                            rs[0].mnem = param.mnem;
                            rs[0].value = param.value;
                            rs[0].unit = param.unit;
                            rs[0].description = param.description;
                            rs[0].save().then(() => {
                                response.push({param: param, result: "UPDATED"});
                                next();
                            }).catch(err => {
                                response.push({param: param, result: "ERROR : " + err.message});
                                next();
                            });
                        }
                    }).catch(err => {
                        console.log(err);
                        response.push({param: param, result: "Error " + err});
                        next();
                    })
                }, function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
                });
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No dataset found by id"));
            }
        });
    }
}

async function createMdCurve(payload, done, dbConnection, username) {
    let createMD = require('./create-md-curve');
    let dataset = await dbConnection.Dataset.findById(payload.idDataset);
    let well = await dbConnection.Well.findById(dataset.idWell);
    let project = await dbConnection.Project.findById(well.idProject);
    let parents = {
        username: username,
        project: project.name,
        well: well.name,
        dataset: dataset.name
    };
    let result = await createMD(parents, dataset, dbConnection);
    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", result));
}

module.exports = {
    createNewDataset: createNewDataset,
    editDataset: editDataset,
    deleteDataset: deleteDataset,
    getDatasetInfo: getDatasetInfo,
    duplicateDataset: duplicateDataset,
    getDatasetInfoByName: getDatasetInfoByName,
    updateDatasetParams: updateDatasetParams,
    createMdCurve: createMdCurve
};