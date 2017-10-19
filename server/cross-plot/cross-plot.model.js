var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var asyncLoop = require('node-async-loop');

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
    if (crossPlotInfo.crossTemplate) {
        console.log("NEW CROSS TEMPLATE : ", crossPlotInfo.crossTemplate);
        let myData = null;
        try {
            myData = require('./cross-template/' + crossPlotInfo.crossTemplate + '.json');
        } catch (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CrossPlot type not found"));
        }
        myData.name = crossPlotInfo.name ? crossPlotInfo.name : myData.name;
        // console.log(myData);
        CrossPlot.create({
            name: myData.name,
            idWell: crossPlotInfo.idWell
        }).then(crossPlot => {
            let idCrossPlot = crossPlot.idCrossPlot;
            let idWell = crossPlotInfo.idWell;
            PointSet.create({
                idCrossPlot: idCrossPlot,
                idWell: idWell
            }).then(pointSet => {
                let idPointSet = pointSet.idPointSet;
                asyncLoop(myData.curveX.families, function (family, next) {
                    findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                        if (idFamily) {
                            dbConnection.Curve.findOne({where: {idFamily: idFamily}}).then(curve => {
                                if (curve) {
                                    next(curve);
                                } else {
                                    next();
                                }
                            }).catch();
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
                        }).catch()
                    }
                    asyncLoop(myData.curveY.families, function (family, next) {
                        findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                            if (idFamily) {
                                dbConnection.Curve.findOne({where: {idFamily: idFamily}}).then(curve => {
                                    if (curve) {
                                        next(curve);
                                    } else {
                                        next();
                                    }
                                }).catch();
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
        Well.findById(crossPlotInfo.idWell).then(well => {
            crossPlotInfo.referenceTopDepth = well.topDepth;
            crossPlotInfo.referenceBottomDepth = well.bottomDepth;
            CrossPlot.sync()
                .then(
                    function () {
                        var crossPlot = CrossPlot.build({
                            idWell: crossPlotInfo.idWell,
                            name: crossPlotInfo.name,
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
        }).catch();
    }

}

function editCrossPlot(crossPlotInfo, done, dbConnection) {
    // console.log(crossPlotInfo);
    var CrossPlot = dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            if (crossPlot) {
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

module.exports = {
    createNewCrossPlot: createNewCrossPlot,
    editCrossPlot: editCrossPlot,
    deleteCrossPlot: deleteCrossPlot,
    getCrossPlotInfo: getCrossPlotInfo
};

