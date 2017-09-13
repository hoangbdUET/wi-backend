"use strict";
var models = require('../models');

let Project = models.Project;
let Well = models.Well;
let Dataset = models.Dataset;
let Curve = models.Curve;

function getProjectById(idProject, callback) {
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

function getWellById(idWell, callback) {
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

function getDatasetById(idDataset, callback) {
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

function getCurveById(idCurve, callback) {
    Curve.findById(idCurve).then(curve => {
        callback(null, curve.name);
    }).catch(err => {
        callback(err, null);
    })
}


module.exports = {
    getProjectById: getProjectById,
    getWellById: getWellById,
    getDatasetById: getDatasetById,
    getCurveById: getCurveById
}