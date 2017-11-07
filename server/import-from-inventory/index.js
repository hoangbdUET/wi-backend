var config = require('config');
var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var asyncLoop = require('async/each');
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

function createNewWell(wellInfo, projectInfo, dbConnection, callback) {
    let response = new Object();
    asyncLoop(wellInfo, function (well, next) {
        dbConnection.Well.create({
            name: well.name,
            topDepth: well.startDepth,
            bottomDepth: well.stopDepth,
            step: well.step,
            idProject: projectInfo.idProject
        }).then(myWell => {
            asyncLoop(well.datasets, function (dataset, next) {
                dbConnection.Dataset.create({
                    name: dataset.name,
                    datasetKey: dataset.datasetKey,
                    datasetLabel: dataset.datasetLabel,
                    idWell: myWell.idWell
                }).then(myDataset => {
                    asyncLoop(dataset.curves, function (curve, next) {
                        dbConnection.Curve.create({
                            name: curve.name,
                            unit: curve.unit,
                            initValue: "0",
                            idDataset: myDataset.idDataset
                        }).then(myCurve => {
                            let pathString = projectInfo.username + projectInfo.projectname + myWell.name + myDataset.name + myCurve.name;
                            syncDataFromInventory(curve.path, pathString, myCurve.name, function (err, result) {
                                if (err) {
                                    console.log(err)
                                    next(err);
                                } else {
                                    next();
                                }
                            });
                        }).catch(err => {
                            if (err) console.log(err);
                            next(err);
                        })
                    }, function (err) {
                        console.log("DONE CURVE");
                        next();
                    });
                }).catch(err => {
                    next(err);
                });
            }, function (err) {
                console.log("DONE DATASET");
                next();
            });

        }).catch(err => {
            next(err);
        });
    }, function (err) {
        if (err) console.log(err);
        console.log("DONE WELL");
        callback(null, response);
    });
}

function createNewDataset(datasetInfo, projectInfo, wellInfo, dbConnection, callback) {
    let response = new Object();
    // console.log(datasetInfo);
    dbConnection.Dataset.create({
        name: datasetInfo.name,
        datasetKey: datasetInfo.datasetKey,
        datasetLabel: datasetInfo.datasetLabel,
        idWell: wellInfo.idWell
    }).then(myDataset => {
        // console.log(myDataset);
        asyncLoop(datasetInfo.curves, function (curve, next) {
            dbConnection.Curve.create({
                name: curve.name,
                unit: curve.unit,
                initValue: "0",
                idDataset: myDataset.idDataset
            }).then(myCurve => {
                let pathString = projectInfo.username + projectInfo.projectname + wellInfo.name + myDataset.name + myCurve.name;
                syncDataFromInventory(curve.path, pathString, myCurve.name, function (err, result) {
                    if (err) {
                        console.log(err)
                        next(err);
                    } else {
                        next();
                    }
                });
            }).catch(err => {
                if (err) console.log(err);
                next(err);
            })
        }, function (err) {
            console.log("DONE CURVE");
            callback(null, "Done");
        });
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
}

function createNewCurve(curveInfo, projectInfo, wellInfo, datasetInfo, dbConnection, callback) {
    dbConnection.Curve.create({
        name: curveInfo.name,
        unit: curveInfo.unit,
        initValue: "0",
        idDataset: datasetInfo.idDataset
    }).then(myCurve => {
        let pathString = projectInfo.username + projectInfo.projectname + wellInfo.name + datasetInfo.name + myCurve.name;
        console.log(pathString);
        syncDataFromInventory(curveInfo.path, pathString, myCurve.name, function (err, result) {
            if (err) {
                console.log(err)
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }).catch(err => {
        callback(err, null);
    })
}

router.post('/inventory/sync', function (req, res) {
    let dbConnection = req.dbConnection;
    let Well = dbConnection.Well;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let myData = req.body.project;
    let userName = req.decoded.username;
    let projectName = myData.projectname;
    let overwriteWell = myData.overwritewell;
    let dataForpath = {
        username: userName,
        projectname: projectName
    }
    findProjectByName(projectName, dbConnection, function (err, project) {
        dataForpath.idProject = project.idProject;
        if (!err) {
            asyncLoop(myData.wells, function (well, next) {
                let overwriteDataset = well.overwritedataset;
                findWellByName(well.name, project.idProject, dbConnection, function (err, foundWell) {
                    if (!err) {
                        if (overwriteWell) {
                            asyncLoop(well.datasets, function (dataset, next) {
                                findDatasetByName(dataset.name, foundWell.idWell, dbConnection, function (noDataset, foundDataset) {
                                    let overwriteCurve = dataset.overwritecurve;
                                    if (noDataset) {
                                        //create new dataset
                                        createNewDataset(dataset, dataForpath, {
                                            idWell: foundWell.idWell,
                                            name: foundWell.name
                                        }, dbConnection, function (err, result) {
                                            next();
                                        });
                                    } else {
                                        if (overwriteDataset) {
                                            asyncLoop(dataset.curves, function (curve, next) {
                                                findCurveByName(curve.name, foundDataset.idDataset, dbConnection, function (noCurve, foundCurve) {
                                                    if (noCurve) {
                                                        createNewCurve(curve, dataForpath, {
                                                            name: foundWell.name,
                                                            idWell: foundWell.idWell
                                                        }, {
                                                            idDataset: foundDataset.idDataset,
                                                            name: foundDataset.name
                                                        }, dbConnection, function (err, result) {
                                                            next();
                                                        });
                                                    } else {
                                                        if (overwriteCurve) {
                                                            let pathString = dataForpath.username + dataForpath.projectname + foundWell.name + foundDataset.name + foundCurve.name;
                                                            syncDataFromInventory(curve.path, pathString, foundCurve.name, function (err, result) {
                                                                next();
                                                            });
                                                        } else {
                                                            next();
                                                        }
                                                    }
                                                });
                                            }, function (err) {
                                                next();
                                            });
                                        } else {
                                            next();
                                        }
                                    }
                                });
                            }, function (err) {
                                console.log("finish dataset");
                                next();
                            });
                        } else {
                            next();
                            myData.wells.splice(well, 1);
                        }
                    } else {
                        console.log(err);
                        console.log("CREATE NEW WELL");
                        createNewWell(myData.wells, dataForpath, dbConnection, function (err, result) {
                            next();
                        });
                    }
                });
            }, function (err) {
                res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Successfull"));
            });
        } else {
            console.log(err);
            res.status(200).send(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Err", err));
        }
    });
});
module.exports = router;