var models = require('../models');
var Dataset = models.Dataset;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewDataset(datasetInfo, done) {
    Dataset.sync()
        .then(function () {
                var dataset = Dataset.build({
                    idWell:datasetInfo.idWell,
                    name: datasetInfo.name
                });
                dataset.save()
                    .then(function (dataset) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Success", {idDataset: dataset.idDataset}));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name + ". Probably idWell not exist/ Can't create two dataset with common ID"));
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
            dataset.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Success", datasetInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset not exist"))
        });
}
function deleteDataset(datasetInfo, done) {
    Dataset.findById(datasetInfo.idDataset)
        .then(function (dataset) {
            dataset.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Deleted", dataset));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}
function getDatasetInfo(dataset, done) {
    Dataset.findById(dataset.idDataset, {include: [{all: true}]})
        .then(function (dataset) {
            if (!dataset) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", dataset));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}

module.exports = {
    createNewDataset:createNewDataset,
    editDataset:editDataset,
    deleteDataset:deleteDataset,
    getDatasetInfo:getDatasetInfo
};