"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let config = require('config');
let fs = require('fs');
let asyncEach = require('async/each');

function createNewDataset(datasetInfo, done, dbConnection) {
    var Dataset = dbConnection.Dataset;
    Dataset.sync()
        .then(function () {
                var dataset = Dataset.build({
                    idWell: datasetInfo.idWell,
                    name: datasetInfo.name,
                    datasetKey: datasetInfo.datasetKey,
                    datasetLabel: datasetInfo.datasetLabel
                });
                dataset.save()
                    .then(function (dataset) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Dataset success", {idDataset: dataset.idDataset}));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Dataset name existed!"));
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        );
}

function editDataset(datasetInfo, done, dbConnection, username) {
    dbConnection.Dataset.findById(datasetInfo.idDataset).then(dataset => {
        if (dataset) {
            if (dataset.name != datasetInfo.name) {
                let datasetname = dataset.name;
                dataset.name = datasetInfo.name;
                dataset.datasetKey = datasetInfo.datasetKey;
                dataset.datasetLabel = datasetInfo.datasetLabel;
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
                        })
                    }).catch(err => {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
                    });
                }).catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Dataset name existed", err));
                });
            } else {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Nothing", datasetInfo));
            }
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No dataset found!"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function deleteDataset(datasetInfo, done, dbConnection) {
    var Dataset = dbConnection.Dataset;
    Dataset.findById(datasetInfo.idDataset)
        .then(function (dataset) {
            dataset.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Dataset is deleted", dataset));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for delete"));
        });
}

function getDatasetInfo(dataset, done, dbConnection) {
    var Dataset = dbConnection.Dataset;
    Dataset.findById(dataset.idDataset, {include: [{all: true}]})
        .then(function (dataset) {
            if (!dataset) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Dataset success", dataset));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for get info"));
        });
}

module.exports = {
    createNewDataset: createNewDataset,
    editDataset: editDataset,
    deleteDataset: deleteDataset,
    getDatasetInfo: getDatasetInfo
};