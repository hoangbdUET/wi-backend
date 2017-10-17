"use strict";
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;
var config = require('config');
var fs = require('fs');


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
    console.log(datasetInfo.name);
    var Dataset = dbConnection.Dataset;
    var Curve = dbConnection.Curve;
    var Well = dbConnection.Well;
    var Project = dbConnection.Project;
    Dataset.findById(datasetInfo.idDataset).then(function (dataset) {
        Dataset.findOne({
            where: {
                idWell: datasetInfo.idWell,
                name: datasetInfo.name
            }
        }).then(d => {
            if (d) {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error! Dataset name existed!"));
            } else {
                Well.findById(dataset.idWell).then(well => {
                    Project.findById(well.idProject).then(project => {
                        Curve.findAll({where: {idDataset: datasetInfo.idDataset}}).then(curves => {
                            curves.forEach(function (curve) {
                                let datasetname = dataset.name;
                                let path = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                let newPath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + datasetInfo.name + curve.name, curve.name + '.txt');
                                try {
                                    var copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
                                    copy.on('close', function () {
                                        hashDir.deleteFolder(config.curveBasePath, username + project.name + well.name + datasetname + curve.name);
                                        dataset.name = datasetInfo.name;
                                        dataset.idWell = datasetInfo.idWell;
                                        dataset.datasetKey = datasetInfo.datasetKey;
                                        dataset.datasetLabel = datasetInfo.datasetLabel;
                                        dataset.save()
                                            .then(function () {
                                                done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Dataset success", datasetInfo));
                                            })
                                            .catch(function (err) {
                                                //done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name));
                                                console.log(err.message);
                                            })
                                    });
                                    copy.on('error', function (err) {
                                        return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit dataset name", err));
                                        //console.log(err);
                                    });
                                } catch (err) {
                                    console.log(err);
                                    return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit dataset name", err));
                                }
                            });
                        })
                    })
                }).catch(err => {
                    console.log(err);
                });
            }
        }).catch();

    })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for edit"))
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