var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var asyncLoop = require('async/each');
var asyncSeries = require('async/series');

let findFamilyIdByName = function (familyName, dbConnection, callback) {
    dbConnection.Family.findOne({where: {name: familyName}}).then(family => {
        if (family) {
            callback(family.idFamily);
        } else {
            callback(null);
        }
    }).catch((err) => {
        console.log(err);
        callback(null);
    })
}

function createNewCrossPlot(crossPlotInfo, done, dbConnection) {
    // console.log(crossPlotInfo);
    var CrossPlot = dbConnection.CrossPlot;
    var Well = dbConnection.Well;
    var PointSet = dbConnection.PointSet;
    let foundCurveX = false;
    let foundCurveY = false;
    Well.findById(crossPlotInfo.idWell).then(well => {
        var myData;
        crossPlotInfo.referenceTopDepth = well.topDepth;
        crossPlotInfo.referenceBottomDepth = well.bottomDepth;
        if (crossPlotInfo.crossTemplate) {
            console.log("NEW CROSS TEMPLATE : ", crossPlotInfo.crossTemplate);
            myData = null;
            try {
                myData = require('./cross-template/' + crossPlotInfo.crossTemplate + '.json');
            } catch (err) {
                return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CrossPlot type not found"));
            }
            myData.name = crossPlotInfo.name ? crossPlotInfo.name : myData.name;
            // console.log(myData);
            CrossPlot.create({
                name: myData.name,
                idWell: crossPlotInfo.idWell,
                referenceTopDepth: crossPlotInfo.referenceTopDepth,
                referenceBottomDepth: crossPlotInfo.referenceBottomDepth
            }).then(crossPlot => {
                let idCrossPlot = crossPlot.idCrossPlot;
                let idWell = crossPlotInfo.idWell;
                PointSet.create({
                    idCrossPlot: idCrossPlot,
                    idWell: idWell,
                    intervalDepthTop: well.topDepth,
                    intervalDepthBottom: well.bottomDepth,
                    majorX: 5,
                    majorY: 5,
                    minorX: 5,
                    minorY: 5
                }).then(pointSet => {
                    let idPointSet = pointSet.idPointSet;
                    asyncLoop(myData.curveX.families, function (family, next) {
                        findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                            if (idFamily) {
                                dbConnection.Dataset.findAll({where: {idWell: crossPlotInfo.idWell}}).then(datasets => {
                                    asyncLoop(datasets, function (dataset, next) {
                                        dbConnection.Curve.findOne({
                                            where: {
                                                idFamily: idFamily,
                                                idDataset: dataset.idDataset
                                            }
                                        }).then(curve => {
                                            if (curve) {
                                                next(curve);
                                            } else {
                                                next();
                                            }
                                        }).catch();
                                    }, function (found) {
                                        if (found) {
                                            next(found);
                                        } else {
                                            next();
                                        }
                                    });
                                });
                            } else {
                                next();
                            }
                        });
                    }, function (curveX) {
                        if (curveX) {
                            foundCurveX = true;
                            PointSet.update({
                                idCurveX: curveX.idCurve
                            }, {
                                where: {
                                    idPointSet: idPointSet
                                }
                            }).then(rs => {
                                console.log("Added curveX ", curveX.name, " to Point Set");
                            }).catch();
                        }
                        asyncLoop(myData.curveY.families, function (family, next) {
                            findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                                if (idFamily) {
                                    dbConnection.Dataset.findAll({where: {idWell: crossPlotInfo.idWell}}).then(datasets => {
                                        asyncLoop(datasets, function (dataset, next) {
                                            dbConnection.Curve.findOne({
                                                where: {
                                                    idFamily: idFamily,
                                                    idDataset: dataset.idDataset
                                                }
                                            }).then(curve => {
                                                if (curve) {
                                                    next(curve);
                                                } else {
                                                    next();
                                                }
                                            }).catch();
                                        }, function (found) {
                                            if (found) {
                                                next(found);
                                            } else {
                                                next();
                                            }
                                        });
                                    });
                                } else {
                                    next();
                                }
                            });
                        }, function (curveY) {
                            if (curveY) {
                                foundCurveY = true;
                                PointSet.update({
                                    idCurveY: curveY.idCurve
                                }, {
                                    where: {
                                        idPointSet: idPointSet
                                    }
                                }).then(rs => {
                                    console.log("Added curveY ", curveY.name, " to Point Set");
                                }).catch()
                            }
                            CrossPlot.findById(idCrossPlot).then(cross => {
                                cross = cross.toJSON();
                                cross.foundCurveX = foundCurveX;
                                cross.foundCurveY = foundCurveY;
                                done(ResponseJSON(ErrorCodes.SUCCESS, "ALL DONE", cross));
                            });
                        });
                    });
                }).catch(err => {
                    console.log(err.message);
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err));
                });
            }).catch(err => {
                    console.log(err.message);
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Cross Plot name existed", err.message));
                }
            )
        } else {
            CrossPlot.sync()
                .then(
                    function () {
                        var crossPlot = CrossPlot.build({
                            idWell: crossPlotInfo.idWell,
                            name: crossPlotInfo.name,
                            referenceTopDepth: well.topDepth,
                            referenceBottomDepth: well.bottomDepth
                        });
                        crossPlot.save()
                            .then(function (crossPlot) {
                                done(ResponseJSON(ErrorCodes.SUCCESS, "Create new CrossPlot success", crossPlot.toJSON()));
                            })
                            .catch(function (err) {
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Cross Plot existed!"));
                            })
                    },
                    function () {
                        done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
                    }
                )

        }
    });
}

function editCrossPlot(crossPlotInfo, done, dbConnection) {
    // console.log(crossPlotInfo);
    var CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            if (crossPlot) {
                crossPlotInfo.discriminator = JSON.stringify(crossPlotInfo.discriminator);
                Object.assign(crossPlot, crossPlotInfo);
                crossPlot.save()
                    .then(function () {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Edit CrossPlot success", crossPlotInfo));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit CrossPlot " + err.name));
                    })
            } else {
                console.log("NO CROSS PLOT");
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "NO CROSS"));
            }
        })
        .catch(function (err) {
            console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot err", err));
        })
}

function deleteCrossPlot(crossPlotInfo, done, dbConnection) {
    var CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            crossPlot.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "CrossPlot is deleted", crossPlot));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete CrossPlot " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot not found for delete"));
        })
}

function getCrossPlotInfo(crossPlot, done, dbConnection) {
    var CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlot.idCrossPlot, {include: [{all: true, include: [{all: true}]}]})
        .then(function (crossPlot) {
            if (!crossPlot) throw "not exists";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info CrossPlot success", crossPlot));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot not found for get info"));
        })
}

function duplicateCrossplot(payload, done, dbConnection) {
    let CrossPLot = dbConnection.CrossPlot;
    CrossPLot.findById(payload.idCrossPlot, {include: {all: true, include: {all: true}}}).then(crossplot => {
        var newCrossPlot;
        if (crossplot) {
            newCrossPlot = crossplot.toJSON();
            delete newCrossPlot.idCrossPlot;
            delete newCrossPlot.createdAt;
            delete newCrossPlot.updatedAt;
            newCrossPlot.name = newCrossPlot.name + '_' + new Date().toLocaleString('en-US', {timeZone: "Asia/Ho_Chi_Minh"});
            CrossPLot.create(newCrossPlot).then(cr => {
                let idCrossPlot = cr.idCrossPlot;
                asyncSeries([
                        function (callback) {
                            let newPointSet = newCrossPlot.pointsets[0];
                            delete newPointSet.idPointSet;
                            delete newPointSet.createdAt;
                            delete newPointSet.updatedAt;
                            newPointSet.idCrossPlot = idCrossPlot;
                            dbConnection.PointSet.create(newPointSet).then(ps => {
                                callback(null, ps);
                            }).catch(err => {
                                console.log(err);
                                callback(err, null);
                            });
                        },
                        function (callback) {
                            let newPolygons = newCrossPlot.polygons;
                            asyncLoop(newPolygons, function (polygon, next) {
                                delete polygon.idPolygon;
                                delete polygon.updatedAt;
                                delete polygon.createdAt;
                                polygon.idCrossPlot = idCrossPlot;
                                dbConnection.Polygon.create(polygon).then((pl) => {
                                    next();
                                }).catch(err => {
                                    next();
                                });
                            }, function () {
                                callback(null, true);
                            });
                        },
                        function (callback) {
                            let newRegressionlines = newCrossPlot.regressionlines;
                            asyncLoop(newRegressionlines, function (regression, next) {
                                delete regression.idRegressionLine;
                                delete regression.updatedAt;
                                delete regression.createdAt;
                                regression.idCrossPlot = idCrossPlot;
                                dbConnection.RegressionLine.create(regression).then(() => {
                                    next();
                                }).catch(err => {
                                    next();
                                });
                            }, function () {
                                callback(null, true);
                            });
                        },
                        function (callback) {
                            let newTernaries = newCrossPlot.ternaries;
                            asyncLoop(newTernaries, function (ternary, next) {
                                delete ternary.idTernary;
                                delete ternary.updatedAt;
                                delete ternary.createdAt;
                                ternary.idCrossPlot = idCrossPlot;
                                dbConnection.Ternary.create(ternary).then(() => {
                                    next();
                                }).catch(err => {
                                    next();
                                });
                            }, function () {
                                callback(null, true);
                            });
                        },
                        function (callback) {
                            let userDefineLines = newCrossPlot.user_define_line;
                            asyncLoop(userDefineLines, function (line, next) {
                                delete line.idUserDefineLine;
                                delete line.updatedAt;
                                delete line.createdAt;
                                line.idCrossPlot = idCrossPlot;
                                dbConnection.UserDefineLine.create(line).then(() => {
                                    next();
                                }).catch(err => {
                                    next();
                                });
                            }, function () {
                                callback(null, true);
                            });
                        }
                    ],
                    function (err, result) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", result));
                    });
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No cross plot"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    })
}

module.exports = {
    createNewCrossPlot: createNewCrossPlot,
    editCrossPlot: editCrossPlot,
    deleteCrossPlot: deleteCrossPlot,
    getCrossPlotInfo: getCrossPlotInfo,
    duplicateCrossplot: duplicateCrossplot
};

