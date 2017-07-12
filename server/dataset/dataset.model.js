var models = require('../models');
var Dataset = models.Dataset;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewDataset(datasetInfo, done) {
    Dataset.sync()
        .then(function () {
                var dataset = Dataset.build({
                    idWell:datasetInfo.idWell,
                    name: datasetInfo.name,
                    datasetKey:datasetInfo.datasetKey,
                    datasetLabel:datasetInfo.datasetLabel
                });
                dataset.save()
                    .then(function (dataset) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Dataset success", {idDataset: dataset.idDataset}));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + ". Probably idWell not exist/ Can't create two dataset with common ID"));
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        );
}
function editDataset(datasetInfo, done) {
    Dataset.findById(datasetInfo.idDataset)
        .then(function (dataset) {
            dataset.name = datasetInfo.name;
            dataset.idWell = datasetInfo.idWell;
            dataset.datasetKey = datasetInfo.datasetKey;
            dataset.datasetLabel = datasetInfo.datasetLabel;

            dataset.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Dataset success", datasetInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not found for edit"))
        });
}
function deleteDataset(datasetInfo, done) {
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
function getDatasetInfo(dataset, done) {
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
    createNewDataset:createNewDataset,
    editDataset:editDataset,
    deleteDataset:deleteDataset,
    getDatasetInfo:getDatasetInfo
};