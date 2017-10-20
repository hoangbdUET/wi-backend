var config = require('config');
var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var asyncLoop = require('node-async-loop');
var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;
var fs = require('fs-extra');


router.use(bodyParser.json());
router.get('/inventory/', function (req, res) {
    res.send(ResponseJSON(ErrorCodes.SUCCESS, "Hello", "Hello"));
});

function findProjectByName(name, dbConnection, callback) {
    dbConnection.Project.findOne({
        where: {name: name}
    }).then(project => {
        if (project) {
            callback(null, project);
        } else {
            callback("NO_PROJECT", project);
        }
    }).catch(err => {
        console.log(err);
        callback("NO_PROJECT", null);
    });
}

function findWellByName(name, idProject, dbConnection, callback) {
    dbConnection.Well.findOne({
        where: {name: name, idProject: idProject}
    }).then(well => {
        if (well) {
            callback(null, well);
        } else {
            callback("NO_WELL", null);
        }
    }).catch(err => {
        console.log(err);
        callback("NO_WELL", null);
    });
}

function findDatasetByName(name, idWell, dbConnection, callback) {
    dbConnection.Dataset.findOne({
        where: {name: name, idWell: idWell}
    }).then(dataset => {
        if (dataset) {
            callback(null, dataset);
        } else {
            callback("NO_DATASET", null);
        }
    }).catch(err => {
        console.log(err);
        callback("NO_DATASET", null);
    });
}

function findCurveByName(name, idDataset, dbConnection, callback) {
    dbConnection.Curve.findOne({
        where: {name: name, idDataset: idDataset}
    }).then(curve => {
        if (curve) {
            callback(null, curve);
        } else {
            callback("NO_CURVE", null);
        }
    }).catch(err => {
        console.log(err);
        callback("NO_CURVE", null);
    });
}

function syncDataFromInventory(srcPath, newPathString, curveName, callback) {
    console.log("Start copy data");
    let newPath = hashDir.createPath(config.curveBasePath, newPathString, curveName + '.txt');
    fs.copy(srcPath, newPath, function (err) {
        if (err) {
            console.log("ERR COPY FILE : ", err);
            return callback(err, null);
        }
        console.log("Copy file success!")
        callback(null, newPath);
    });
}

// module.exports.syncDataFromInventory = syncDataFromInventory;

function createNewWell(wellInfo, idProject, dbConnection, callback) {
    let response = [];
    asyncLoop(wellInfo, function (well, next) {
        dbConnection.Well.create({
            name : well.name,
            startDepth
        }).then().catch(err => {

        });
    }, function (err) {
        callback(null, response);
    });
}

router.post('/inventory/sync', function (req, res) {
    let dbConnection = req.dbConnection;
    let Well = dbConnection.Well;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let myData = req.body.project;
    let userName = req.decoded.username;
    let projectName = myData.projectname;
    findProjectByName(projectName, dbConnection, function (err, project) {
        if (!err) {
            asyncLoop(myData.wells, function (well, next) {
                findWellByName(well.name, project.idProject, dbConnection, function (err, result) {
                    if (!err) {
                        asyncLoop(well.datasets, function (dataset, next) {
                            findDatasetByName(dataset.name, result.idWell, dbConnection, function (err, result) {
                                if (!err) {
                                    asyncLoop(dataset.curves, function (curve, next) {
                                        findCurveByName(curve.name, result.idDataset, dbConnection, function (err, result) {
                                            if (!err) {
                                                console.log(result);
                                                next();
                                            } else {
                                                console.log(err);
                                                console.log("CREATE CURVE");
                                                next();
                                            }
                                        });
                                    }, function () {
                                        next();
                                    });
                                } else {
                                    console.log(err);
                                    console.log("CREATE DATASET");
                                    next();
                                }
                            });
                        }, function (err) {
                            next();
                        });
                    } else {
                        console.log(err);
                        console.log("CREATE NEW WELL");
                        createNewWell(myData.wells, project.idProject, dbConnection, function (err, result) {
                            next();
                        });
                    }
                });
            }, function (err) {
                res.status(200).send(myData);
            });
        } else {
            console.log(err);
            res.status(200).send(myData);
        }
    });
});
module.exports = router;