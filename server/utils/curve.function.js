let fs = require('fs');
let fsExtra = require('fs-extra');
let hashDir = require('../utils/data-tool').hashDir;
let async = require('async');
let config = require('config');

function checkCurveExisted() {

}

function getFullCurveParents(curve, dbConnection) {
    return new Promise(function (resolve, reject) {
        dbConnection.Curve.findByPk(curve.idCurve, {paranoid: false}).then(async c => {
            if (c) {
                let dataset = await dbConnection.Dataset.findByPk(c.idDataset, {paranoid: false});
                let well = await dbConnection.Well.findByPk(dataset.idWell, {paranoid: false});
                let project = await dbConnection.Project.findByPk(well.idProject, {paranoid: false});
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
    let srcPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, srcCurve.username + srcCurve.project + srcCurve.well + srcCurve.dataset + srcCurve.curve, srcCurve.curve + '.txt');
    let desPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, desCurve.username + desCurve.project + desCurve.well + desCurve.dataset + desCurve.curve, desCurve.curve + '.txt');
    console.log("SRC ", process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, srcCurve.username + srcCurve.project + srcCurve.well + srcCurve.dataset + srcCurve.curve);
    console.log("DES ", process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, desCurve.username + desCurve.project + desCurve.well + desCurve.dataset + desCurve.curve);
    console.log("Copy from ", srcPath, " to ", desPath);
    fsExtra.copy(srcPath, desPath).then(() => {
        callback(null, desPath);
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}


function moveCurveData(srcCurve, desCurve, callback) {
    let srcPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, srcCurve.username + srcCurve.project + srcCurve.well + srcCurve.dataset + srcCurve.curve, srcCurve.curve + '.txt');
    let desPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, desCurve.username + desCurve.project + desCurve.well + desCurve.dataset + desCurve.curve, desCurve.curve + '.txt');
    // console.log("Move : ", srcCurve, srcPath);
    // console.log("To : ", desCurve, desPath);
    fsExtra.move(srcPath, desPath).then(() => {
        callback(null, desPath);
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}

function linearInterpolate(point1, point2, y) {
    const x1 = parseFloat(point1.x);
    const x2 = parseFloat(point2.x);
    const y1 = parseFloat(point1.y);
    const y2 = parseFloat(point2.y);

    if (y1 === y2) {
        const avg = (x1 + x2) / 2;
        return { x: avg, y };
    }

    const x = (y - y1) * (x1 - x2) / (y1 - y2) + x1;
    return { x, y };
}

module.exports = {
    moveCurveData: moveCurveData,
    checkCurveExisted: checkCurveExisted,
    copyCurveData: copyCurveData,
    getFullCurveParents: getFullCurveParents,
    linearInterpolate: linearInterpolate,
};