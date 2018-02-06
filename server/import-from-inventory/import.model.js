let curveModels = require('../curve/curve.model');
let asyncEach = require('async/each');
let request = require('request');
let config = require('config');
let asyncQueue = require('async/queue');
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let fs = require('fs-extra');

class Options {
    constructor(path, token, payload) {
        this.method = 'POST';
        this.url = 'http://' + config.Service.inventory + path;
        this.headers = {
            'Cache-Control': 'no-cache',
            Authorization: token,
            'Content-Type': 'application/json'
        };
        this.body = payload;
        this.json = true;
    }
};

function getWellFromInventory(well, token) {
    return new Promise(function (resolve, reject) {
        let options = new Options('/user/well/full-info', token, {idWell: well.idWell});
        request(options, function (error, response, body) {
            if (error) {
                reject(err);
            } else {
                resolve(body.content);
            }
        });
    });
};

async function importWell(well, token, callback, dbConnection, username) {
    try {
        let wiProject = (await dbConnection.Project.findOrCreate({
            where: {
                name: well.projectName
            },
            defaults: {
                name: well.projectName,
                description: "Project created by batch service",
            }
        }))[0];
        let _well = await getWellFromInventory({idWell: well.idWell}, token);
        let topDepth = _well.well_headers.find(h => h.header === 'STRT').value;
        let bottomDepth = _well.well_headers.find(h => h.header === 'STOP').value;
        let step = _well.well_headers.find(h => h.header === 'STEP').value;
        let wiWell = await dbConnection.Well.create({
            name: _well.name,
            idProject: wiProject.idProject,
            topDepth: topDepth,
            bottomDepth: bottomDepth,
            step: step
        });
        asyncEach(_well.datasets, async function (dataset) {
            let wiDataset = await dbConnection.Dataset.create({
                name: dataset.name,
                datasetKey: dataset.name,
                datasetLabel: dataset.name,
                idWell: wiWell.idWell
            });
            let queue = asyncQueue(function (curve, cb) {
                let options = {
                    method: 'POST',
                    url: 'http://' + config.Service.inventory + '/user/well/dataset/curve/data',
                    headers:
                        {
                            Authorization: token,
                            'Content-Type': 'application/json'
                        },
                    body: {idCurve: curve.idCurve},
                    json: true
                };
                dbConnection.Curve.create({
                    name: curve.name,
                    unit: curve.curve_revisions[0].unit,
                    initValue: "batch",
                    idDataset: wiDataset.idDataset
                }).then(c => {
                    let _curve = c;
                    let curvePath = hashDir.createPath(config.curveBasePath, username + wiProject.name + wiWell.name + wiDataset.name + _curve.name, _curve.name + '.txt');
                    try {
                        let stream = request(options).pipe(fs.createWriteStream(curvePath));
                        stream.on('close', function () {
                            cb(null, _curve);
                        });
                        stream.on('error', function (err) {
                            cb(err, null);
                        });
                    } catch (err) {
                        cb(err, null);
                    }
                });
            }, 2);
            queue.drain = function () {
                console.log("All Curve Done");
            };
            dataset.curves.forEach(function (curve) {
                queue.push(curve, function (err, success) {
                });
            });
        }, function () {
            let wellHeaders = _well.well_headers;
            asyncEach(wellHeaders, function (wellHeader, next) {
                dbConnection.WellHeader.findOrCreate({
                    where: {header: wellHeader.header, idWell: wiWell.idWell}, defaults: {
                        header: wellHeader.header,
                        value: wellHeader.value,
                        idWell: wiWell.idWell
                    }
                })
            });
            callback(null, _well.name);
        });
    } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
            callback("Well existed!", null);
        } else {
            callback(e, null);
        }
    }

}

function importCurves(curves, token, callback, dbConnection, username) {
    let response = [];
    asyncEach(curves, function (curve, next) {
        setTimeout(function () {
            curveModels.getCurveDataFromInventory(curve, token, function (err, result) {
                if (err) {
                    response.push(err);
                } else {
                    response.push(result);
                }
                next();
            }, dbConnection, username);
        }, 100);
    }, function () {
        callback(response);
    });
}

function importDataset(datasets, token, callback, dbConnection, username) {
    let response = [];
    asyncEach(datasets, function (dataset, next) {
        let newDataset = {};
        newDataset.name = dataset.name;
        newDataset.datasetKey = dataset.name;
        newDataset.datasetLabel = dataset.name;
        newDataset.idWell = dataset.idDesWell;
        dbConnection.Dataset.findOrCreate({
            where: {name: newDataset.name, idWell: newDataset.idWell},
            defaults: {
                name: newDataset.name,
                idWell: newDataset.idWell,
                datasetKey: newDataset.datasetKey,
                datasetLabel: newDataset.datasetLabel
            }
        }).then(rs => {
            let _dataset = rs[0];
            asyncEach(dataset.curves, function (curve, nextCurve) {
                setTimeout(function () {
                    curve.idDesDataset = _dataset.idDataset;
                    curveModels.getCurveDataFromInventory(curve, token, function (err, result) {
                        if (err) {
                            response.push(err);
                            nextCurve();
                        } else {
                            response.push(result);
                            nextCurve();
                        }
                    }, dbConnection, username);
                }, 100);
            }, function () {
                next();
            });
        }).catch(err => {
            console.log(err);
            response.push(err);
            next();
        });
    }, function () {
        callback(response);
    });
}

module.exports = {
    importCurves: importCurves,
    importDataset: importDataset,
    importWell: importWell
}