let fs = require('fs');
let fsExtra = require('fs-extra');
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let async = require('async');
let config = require('config');

function checkCurveExisted() {

}

function getFullCurveParents(curve, dbConnection) {
    return new Promise(function (resolve, reject) {
        dbConnection.Curve.findById(curve.idCurve, {paranoid: false}).then(async c => {
            if (c) {
                let dataset = await dbConnection.Dataset.findById(c.idDataset, {paranoid: false});
                let well = await dbConnection.Well.findById(dataset.idWell, {paranoid: false});
                let project = await dbConnection.Project.findById(well.idProject, {paranoid: false});
                resolve({
                    project: project.name,
                    well: well.name,
                    dataset: dataset.name,
                    curve: c.name
                });
            } else {
                console.log("No Curve found when get full curve's parents", curve);
                resolve(null);
            }
        }).catch(err => {
            console.log(err);
            resolve(null);
        });
    });
}

/*
    srcCurve = desCurve = {
        username: 'hoang',
        project: 'myProject',
        well: 'myWell',
        dataset: 'myDataset',
        curve: 'myCurve'
    }
 */

function copyCurveData(srcCurve, desCurve, callback) {
    let srcPath = hashDir.createPath(config.curveBasePath, srcCurve.username + srcCurve.project + srcCurve.well + srcCurve.dataset + srcCurve.curve, srcCurve.curve + '.txt');
    let desPath = hashDir.createPath(config.curveBasePath, desCurve.username + desCurve.project + desCurve.well + desCurve.dataset + desCurve.curve, desCurve.curve + '.txt');
    console.log("SRC ", config.curveBasePath, srcCurve.username + srcCurve.project + srcCurve.well + srcCurve.dataset + srcCurve.curve);
    console.log("DES ", config.curveBasePath, desCurve.username + desCurve.project + desCurve.well + desCurve.dataset + desCurve.curve);
    console.log("Copy from ", srcPath, " to ", desPath);
    fsExtra.copy(srcPath, desPath).then(() => {
        callback(null, desPath);
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}


function moveCurveData(srcCurve, desCurve, callback) {
    let srcPath = hashDir.createPath(config.curveBasePath, srcCurve.username + srcCurve.project + srcCurve.well + srcCurve.dataset + srcCurve.curve, srcCurve.curve + '.txt');
    let desPath = hashDir.createPath(config.curveBasePath, desCurve.username + desCurve.project + desCurve.well + desCurve.dataset + desCurve.curve, desCurve.curve + '.txt');
    // console.log("Move : ", srcCurve, srcPath);
    // console.log("To : ", desCurve, desPath);
    fsExtra.move(srcPath, desPath).then(() => {
        callback(null, desPath);
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}

module.exports = {
    moveCurveData: moveCurveData,
    checkCurveExisted: checkCurveExisted,
    copyCurveData: copyCurveData,
    getFullCurveParents: getFullCurveParents
};