let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncLoop = require('async/each');
let asyncSeries = require('async/series');

let findFamilyIdByName = function (familyName, dbConnection, callback) {
    dbConnection.Family.findOne({
        where: {name: familyName},
        // include: {model: dbConnection.FamilySpec, as: 'family_spec', where: {isDefault: true}}
        include: {model: dbConnection.FamilySpec, as: 'family_spec'}
    }).then(family => {
        if (family) {
            let familyObj = family.toJSON();
            familyObj.blockPosition = familyObj.family_spec[0].blockPosition;
            familyObj.displayMode = familyObj.family_spec[0].displayMode;
            familyObj.displayType = familyObj.family_spec[0].displayType;
            familyObj.lineColor = familyObj.family_spec[0].lineColor;
            familyObj.lineStyle = familyObj.family_spec[0].lineStyle;
            familyObj.lineWidth = familyObj.family_spec[0].lineWidth;
            familyObj.maxScale = familyObj.family_spec[0].maxScale;
            familyObj.minScale = familyObj.family_spec[0].minScale;
            familyObj.unit = familyObj.family_spec[0].unit;
            callback(familyObj.idFamily, {minScale: familyObj.minScale, maxScale: familyObj.maxScale});
        } else {
            callback(null, null);
        }
    }).catch((err) => {
        console.log(err);
        callback(null, null);
    })
}


function createNewCrossPlot(crossPlotInfo, done, dbConnection) {
    if (crossPlotInfo.axisColors && typeof(crossPlotInfo.axisColors === "object")) {
        JSON.stringify(crossPlotInfo.axisColors);
    }
    if (crossPlotInfo.crossTemplate && crossPlotInfo.datasets) {
        let myData = null;
        try {
            myData = require('./cross-template/' + crossPlotInfo.crossTemplate + '.json');
        } catch (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CrossPlot type not found"));
        }
        dbConnection.CrossPlot.create({
            idProject: crossPlotInfo.idProject,
            name: crossPlotInfo.name,
            axisColors: crossPlotInfo.axisColors,
            createdBy: crossPlotInfo.createdBy,
            updatedBy: crossPlotInfo.updatedBy,
            configs: crossPlotInfo.configs
        }).then(_cr => {
            asyncLoop(crossPlotInfo.datasets, (dataset, nextDataset) => {
                let found = {
                    curveX: {},
                    curveY: {}
                };
                asyncLoop(myData.curveX.families, function (family, nextFamily) {
                    findFamilyIdByName(family.name, dbConnection, function (idFamily, scale) {
                        if (idFamily) {
                            dbConnection.Curve.findOne({
                                where: {
                                    idFamily: idFamily,
                                    idDataset: dataset.idDataset
                                }
                            }).then(curve => {
                                if (curve) {
                                    let curveX = curve.toJSON();
                                    curveX.scaleLeft = scale.minScale;
                                    curveX.scaleRight = scale.maxScale;
                                    found.curveX = curveX;
                                    nextFamily();
                                } else {
                                    nextFamily();
                                }
                            })
                        } else {
                            nextFamily();
                        }
                    });
                }, function () {
                    asyncLoop(myData.curveY.families, function (family, nextFamily) {
                        findFamilyIdByName(family.name, dbConnection, function (idFamily, scale) {
                            if (idFamily) {
                                dbConnection.Curve.findOne({
                                    where: {
                                        idFamily: idFamily,
                                        idDataset: dataset.idDataset
                                    }
                                }).then(curve => {
                                    if (curve) {
                                        let curveY = curve.toJSON();
                                        curveY.scaleTop = scale.maxScale;
                                        curveY.scaleBottom = scale.minScale;
                                        found.curveY = curveY;
                                        nextFamily();
                                    } else {
                                        nextFamily();
                                    }
                                })
                            } else {
                                nextFamily();
                            }
                        });
                    }, function () {
                        let pointset = {};
                        pointset.idCurveX = found.curveX.idCurve;
                        pointset.idCurveY = found.curveY.idCurve;
                        pointset.scaleLeft = found.curveX.scaleLeft;
                        pointset.scaleRight = found.curveX.scaleRight;
                        pointset.scaleBottom = found.curveY.scaleBottom;
                        pointset.scaleTop = found.curveY.scaleTop;
                        pointset.idCrossPlot = _cr.idCrossPlot;
                        pointset.intervalDepthTop = dataset.top;
                        pointset.intervalDepthBottom = dataset.bottom;
                        pointset.majorX = 5;
                        pointset.majorY = 5;
                        pointset.minorX = 1;
                        pointset.minorY = 1;
                        pointset.createdBy = crossPlotInfo.createdBy;
                        pointset.updatedBy = crossPlotInfo.updatedBy;
                        if (pointset.idCurveX && pointset.idCurveY) {
                            dbConnection.PointSet.create(pointset).then(nextDataset()).catch(err => {
                                nextDataset()
                            });
                        } else {
                            nextDataset();
                        }
                    });
                });
            }, function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Create new CrossPlot success", _cr));
            });
        }).catch(err => {

            if (err.name === "SequelizeUniqueConstraintError") {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Cross plot's name already exists"));
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    } else {
        dbConnection.CrossPlot.create({
            idProject: crossPlotInfo.idProject,
            name: crossPlotInfo.name,
            axisColors: crossPlotInfo.axisColors,
            createdBy: crossPlotInfo.createdBy,
            updatedBy: crossPlotInfo.updatedBy,
            configs: crossPlotInfo.configs
        }).then(function (crossPlot) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new CrossPlot success", crossPlot.toJSON()));
        }).catch(function (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Cross plot's name already exists"));
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    }
}


function editCrossPlot(crossPlotInfo, done, dbConnection) {
    delete crossPlotInfo.createdBy;
    if (typeof(crossPlotInfo.axisColors === "object")) {
        JSON.stringify(crossPlotInfo.axisColors);
    }
    let CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            if (crossPlot) {
                crossPlotInfo.discriminator = JSON.stringify(crossPlotInfo.discriminator);
                Object.assign(crossPlot, crossPlotInfo);
                crossPlot.save()
                    .then(function (c) {
                        dbConnection.CrossPlot.findById(c.idCrossPlot, {include: {all: true}}).then(_c => {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Edit CrossPlot success", _c));
                        });
                    })
                    .catch(function (err) {
                        if (err.name === "SequelizeUniqueConstraintError") {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists"));
                        } else {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                        }
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
    let CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            crossPlot.setDataValue('updatedBy', crossPlotInfo.updatedBy);
            crossPlot.destroy({permanently: true, force: true})
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "CrossPlot is deleted", crossPlot));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete CrossPlot " + err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot not found for delete"));
        })
}

function getCrossPlotInfo(crossPlot, done, dbConnection) {
    let CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlot.idCrossPlot, {include: [{all: true, include: [{all: true}]}]})
        .then(function (crossPlot) {
            if (!crossPlot) throw "not exists";
            crossPlot = crossPlot.toJSON();
            crossPlot.pointsets = crossPlot.point_sets;
            crossPlot.regressionLines = crossPlot.regression_lines;
            delete crossPlot.regression_lines;
            delete crossPlot.point_sets;
            if (crossPlot.pointsets.length !== 0) {
                asyncSeries([
                    function (cb) {
                        dbConnection.Curve.findById(crossPlot.pointsets[0].idCurveX).then(curve => {
                            if (curve) {
                                cb(null, curve.idCurve);
                            } else {
                                cb(null, null);
                            }
                        });
                    },
                    function (cb) {
                        dbConnection.Curve.findById(crossPlot.pointsets[0].idCurveY).then(curve => {
                            if (curve) {
                                cb(null, curve.idCurve);
                            } else {
                                cb(null, null);
                            }
                        });
                    },
                    function (cb) {
                        dbConnection.Curve.findById(crossPlot.pointsets[0].idCurveZ).then(curve => {
                            if (curve) {
                                cb(null, curve.idCurve);
                            } else {
                                cb(null, null);
                            }
                        });
                    },
                    function (cb) {
                        asyncLoop(crossPlot.reference_curves, function (ref, next) {
                            dbConnection.Curve.findById(ref.idCurve).then(curve => {
                                if (curve) {
                                    next();
                                } else {
                                    ref.idCurve = null;
                                    next();
                                }
                            });
                        }, function () {
                            cb(null, null);
                        })
                    }
                ], function (err, result) {
                    crossPlot.pointsets[0].idCurveX = result[0];
                    crossPlot.pointsets[0].idCurveY = result[1];
                    crossPlot.pointsets[0].idCurveZ = result[2];
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Get info CrossPlot success", crossPlot));
                });
            } else {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Get info CrossPlot success", crossPlot));
            }
        })
        .catch(function (e) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot not found for get info"));
        })
}

function duplicateCrossplot(payload, done, dbConnection) {
    let CrossPLot = dbConnection.CrossPlot;
    CrossPLot.findById(payload.idCrossPlot, {include: {all: true, include: {all: true}}}).then(crossplot => {
        let newCrossPlot;
        if (crossplot) {
            newCrossPlot = crossplot.toJSON();
            delete newCrossPlot.idCrossPlot;
            delete newCrossPlot.createdAt;
            delete newCrossPlot.updatedAt;
            // newCrossPlot.name = newCrossPlot.name + '_' + new Date().toLocaleString('en-US', {timeZone: "Asia/Ho_Chi_Minh"});
            newCrossPlot.duplicated = 1;
            newCrossPlot.name = newCrossPlot.name + "_COPY_" + crossplot.duplicated;
            newCrossPlot.createdBy = payload.createdBy;
            newCrossPlot.updatedBy = payload.updatedBy;
            crossplot.duplicated++;
            crossplot.save();
            CrossPLot.create(newCrossPlot).then(cr => {
                let idCrossPlot = cr.idCrossPlot;
                asyncSeries([
                        function (callback) {
                            asyncLoop(newCrossPlot.point_sets, function (point_set, next) {
                                let newPointSet = point_set;
                                delete newPointSet.idPointSet;
                                delete newPointSet.createdAt;
                                delete newPointSet.updatedAt;
                                newPointSet.createdBy = payload.createdBy;
                                newPointSet.updatedBy = payload.updatedBy;
                                newPointSet.idCrossPlot = idCrossPlot;
                                dbConnection.PointSet.create(newPointSet).then(ps => {
                                    callback(null, ps);
                                }).catch(err => {
                                    console.log(err);
                                    next();
                                });
                            }, function () {
                                callback();
                            });
                        },
                        function (callback) {
                            let newPolygons = newCrossPlot.polygons;
                            asyncLoop(newPolygons, function (polygon, next) {
                                delete polygon.idPolygon;
                                delete polygon.updatedAt;
                                delete polygon.createdAt;
                                polygon.idCrossPlot = idCrossPlot;
                                polygon.createdBy = payload.createdBy;
                                polygon.updatedBy = payload.updatedBy;
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
                                regression.createdBy = payload.createdBy;
                                regression.updatedBy = payload.updatedBy;
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
                                ternary.createdBy = payload.createdBy;
                                ternary.updatedBy = payload.updatedBy;
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
                                line.createdBy = payload.createdBy;
                                line.updatedBy = payload.updatedBy;
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
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
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

