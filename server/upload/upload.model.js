"use strict";

/*var models = require('../models');

let Project = models.Project;
let Well = models.Well;
let Dataset = models.Dataset;
let Curve = models.Curve;*/

function getProjectById(idProject, callback, dbConnection) {
    var Project = dbConnection.Project;
    Project.findById(idProject).then(project => {
        if (project) {
            callback(null, project.name);
        } else {
            callback(null, null);
        }
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}

function getWellById(idWell, callback, dbConnection) {
    var Well = dbConnection.Well;
    Well.findById(idWell).then(well => {
        if (well) {
            callback(null, well.name);
        } else {
            callback(null, null);
        }
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}

function getDatasetById(idDataset, callback, dbConnection) {
    var Dataset = dbConnection.Dataset;
    Dataset.findById(idDataset).then(dataset => {
        if (dataset) {
            callback(null, dataset.name);
        } else {
            callback(null, null);
        }
    }).catch(err => {
        console.log(err);
        callback(err, null);
    })
}

function getCurveById(idCurve, callback, dbConnection) {
    var Curve = dbConnection.Curve;
    Curve.findById(idCurve).then(curve => {
        callback(null, curve.name);
    }).catch(err => {
        callback(err, null);
    })
}

function findIdByName(idProject, wellName, datasetName, callback, dbConnection) {
    var Well = dbConnection.Well;
    var Dataset = dbConnection.Dataset;
    Well.find({
        where: {
            idProject: idProject,
            name: wellName
        }
    }).then(wells => {
        //console.log(wells.idWell);
        if (datasetName == null) {
            callback(null, wells.idWell);
        } else {
            Dataset.find({
                where: {
                    idWell: wells.idWell,
                    name: datasetName
                }
            }).then(datasets => {
                //console.log("ID DATASET" + datasets[0].idDataset);
                if (!datasets) {
                    callback("NO DATASET", null);
                } else {
                    callback(null, datasets.idDataset);
                }
            }).catch(err => {
                callback(err, null);
            });
        }
    }).catch(err => {
        callback(err, null);
    });
}

module.exports = {
    findIdByName: findIdByName,
    getProjectById: getProjectById,
    getWellById: getWellById,
    getDatasetById: getDatasetById,
    getCurveById: getCurveById
}