"use strict";
var models = require('../models');
var Histogram = models.Histogram;
var Zone = models.Zone;
var ZoneSet = models.ZoneSet;
var Curve = models.Curve;
var Well = models.Well;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
let asyncLoop = require('node-async-loop');

let findFamilyIdByName = function (familyName, dbConnection, callback) {
    dbConnection.Family.findOne({where: {name: familyName}}).then(family => {
        if (family) {
            callback(family);
        } else {
            callback(null);
        }
    }).catch((err) => {
        console.log(err);
        callback(null);
    })
}

function createNewHistogram(histogramInfo, done, dbConnection) {
    var Histogram = dbConnection.Histogram;
    var Well = dbConnection.Well;
    Well.findById(parseInt(histogramInfo.idWell)).then(well => {
        histogramInfo.referenceTopDepth = well.topDepth;
        histogramInfo.referenceBottomDepth = well.bottomDepth;
        if (histogramInfo.histogramTemplate) {
            console.log("NEW HISTOGRAM TEMPLATE ", histogramInfo.histogramTemplate);
            let myData = null;
            try {
                myData = require('./histogram-template/' + histogramInfo.histogramTemplate + '.json');
            } catch (err) {
                return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogarm template found"));
            }
            myData.name = histogramInfo.name ? histogramInfo.name : myData.name;
            Histogram.create({
                name: myData.name,
                idWell: histogramInfo.idWell,
                referenceTopDepth: histogramInfo.referenceTopDepth,
                referenceBottomDepth: histogramInfo.referenceBottomDepth,
                intervalDepthTop: histogramInfo.referenceTopDepth,
                intervalDepthBottom: histogramInfo.referenceBottomDepth
            }).then(histogram => {
                // let idHistogram = histogram.idHistogram;
                asyncLoop(myData.families, function (family, next) {
                    findFamilyIdByName(family.name, dbConnection, function (family) {
                        if (family) {
                            dbConnection.Curve.findOne({where: {idFamily: family.idFamily}}).then(curve => {
                                if (curve) {
                                    curve.leftScale = family.minScale;
                                    curve.rightScale = family.maxScale;
                                    next(curve);
                                } else {
                                    next();
                                }
                            }).catch(err => {
                                console.log(err);
                            });
                        } else {
                            next();
                        }
                    });
                }, function (curve) {
                    if (curve) {
                        dbConnection.Histogram.update({
                            idCurve: curve.idCurve,
                            leftScale: curve.leftScale,
                            rightScale: curve.rightScale
                        }, {
                            where: {
                                idHistogram: histogram.idHistogram
                            }
                        }).then(rs => {
                            Histogram.findById(histogram.idHistogram).then(his => {
                                his = his.toJSON();
                                his.noCurveFound = false;
                                return done(ResponseJSON(ErrorCodes.SUCCESS, "Done with curve", his));
                            });
                        }).catch(err => {
                            console.log(err.message);
                        })
                    } else {
                        Histogram.findById(histogram.idHistogram).then(his => {
                            his = his.toJSON();
                            his.noCurveFound = true;
                            done(ResponseJSON(ErrorCodes.SUCCESS, "NO_CURVE_FOUND", his));
                        });
                    }
                });
            }).catch(err => {
                console.log(err.message);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram existed!", err.message));
            })
        } else {
            if (histogramInfo.idZoneSet) {
                Histogram.create(histogramInfo).then(result => {
                    Histogram.findById(result.idHistogram).then(his => {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
                    });
                }).catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram name existed!", err.message));
                });
            } else {
                if (!histogramInfo.intervalDepthTop) {
                    histogramInfo.intervalDepthTop = well.topDepth;
                    histogramInfo.intervalDepthBottom = well.bottomDepth;
                    Histogram.create(histogramInfo).then(result => {
                        Histogram.findById(result.idHistogram).then(his => {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
                        });
                    }).catch(err => {
                        // console.log(err);
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram existed!", err.errors));
                    });

                } else {
                    Histogram.create(histogramInfo).then(result => {
                        Histogram.findById(result.idHistogram).then(his => {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
                        });
                    }).catch(err => {
                        // console.log(err);
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram name existed!", err.errors));
                    });
                }
            }

        }
    });

}

function getHistogram(histogramId, done, dbConnection) {
    var Histogram = dbConnection.Histogram;
    var Curve = dbConnection.Curve;
    var ZoneSet = dbConnection.ZoneSet;
    var Zone = dbConnection.Zone;
    var ReferenceCurve = dbConnection.ReferenceCurve;
    var Discrim = dbConnection.Discrim;
    Histogram.findById(histogramId.idHistogram, {
        include: [{
            model: ZoneSet,
            include: [{model: Zone}]
        }, {
            model: Curve
        }, {
            model: ReferenceCurve,
            include: [{model: Curve}]
        }]
    }).then(rs => {
        if (rs) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram not exists"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    })
}

function editHistogram(histogramInfo, done, dbConnection) {
    var Histogram = dbConnection.Histogram;
    Histogram.findById(histogramInfo.idHistogram)
        .then(function (histogram) {
            Object.assign(histogram, histogramInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit histogram success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit histogram" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "histogram not found for edit"));
        })
}

function deleteHistogram(histogramInfo, done, dbConnection) {
    var Histogram = dbConnection.Histogram;
    Histogram.findById(histogramInfo.idHistogram)
        .then(function (histogram) {
            histogram.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Histogram is deleted", histogram));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Histogram " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Histogram not found for delete"))
        })
}

module.exports = {
    createNewHistogram: createNewHistogram,
    getHistogram: getHistogram,
    editHistogram: editHistogram,
    deleteHistogram: deleteHistogram

};
