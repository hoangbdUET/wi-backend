"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncLoop = require('async/each');

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
            delete familyObj.family_spec;
            callback(familyObj);
        } else {
            callback(null);
        }
    }).catch((err) => {
        console.log(err);
        callback(null);
    })
};

function createNewHistogram(histogramInfo, done, dbConnection) {
    let curves = histogramInfo.idCurves ? histogramInfo.idCurves : [];
    if (histogramInfo.histogramTemplate) {
        console.log("NEW HISTOGRAM TEMPLATE ", histogramInfo.histogramTemplate);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not implemented", "Not implemented"));
    } else {
        dbConnection.Histogram.create(histogramInfo).then(async histogram => {
            await histogram.setCurves(curves);
            dbConnection.Histogram.findById(histogram.idHistogram, {include: {all: true}}).then(h => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", h));
            });
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
        });
    }
}


function createNewHistogram_(histogramInfo, done, dbConnection) {
    let Histogram = dbConnection.Histogram;
    let Well = dbConnection.Well;
    Well.findById(parseInt(histogramInfo.idWell)).then(well => {
        let myData;
        histogramInfo.referenceTopDepth = well.topDepth;
        histogramInfo.referenceBottomDepth = well.bottomDepth;
        if (histogramInfo.histogramTemplate) {
            console.log("NEW HISTOGRAM TEMPLATE ", histogramInfo.histogramTemplate);
            myData = null;
            let loga = false;
            try {
                myData = require('./histogram-template/' + histogramInfo.histogramTemplate + '.json');
            } catch (err) {
                return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogarm template found"));
            }
            myData.name = histogramInfo.name ? histogramInfo.name : myData.name;
            if (histogramInfo.histogramTemplate === "ShadowResistivity" || histogramInfo.histogramTemplate === "DeepResistivity") {
                loga = true;
            }
            Histogram.create({
                name: myData.name,
                idWell: histogramInfo.idWell,
                referenceTopDepth: histogramInfo.referenceTopDepth,
                referenceBottomDepth: histogramInfo.referenceBottomDepth,
                intervalDepthTop: histogramInfo.referenceTopDepth,
                intervalDepthBottom: histogramInfo.referenceBottomDepth,
                loga: loga,
                colorBy: histogramInfo.colorBy,
                createdBy: histogramInfo.createdBy,
                updatedBy: histogramInfo.updatedBy
            }).then(histogram => {
                // let idHistogram = histogram.idHistogram;
                asyncLoop(myData.families, function (family, next) {
                    findFamilyIdByName(family.name, dbConnection, function (family) {
                        if (family) {
                            dbConnection.Dataset.findAll({where: {idWell: histogramInfo.idWell}}).then(datasets => {
                                asyncLoop(datasets, function (dataset, next) {
                                    // next();
                                    dbConnection.Curve.findOne({
                                        where: {
                                            idFamily: family.idFamily,
                                            idDataset: dataset.idDataset
                                        }
                                    }).then(curve => {
                                        if (curve) {
                                            curve.leftScale = family.minScale;
                                            curve.rightScale = family.maxScale;
                                            curve.color = family.lineColor;
                                            next(curve);
                                        } else {
                                            next();
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                    });
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
                }, function (curve) {
                    if (curve) {
                        dbConnection.Histogram.update({
                            idCurve: curve.idCurve,
                            leftScale: curve.leftScale,
                            rightScale: curve.rightScale,
                            color: curve.color
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
    let Histogram = dbConnection.Histogram;
    let Curve = dbConnection.Curve;
    let ZoneSet = dbConnection.ZoneSet;
    let Zone = dbConnection.Zone;
    let ReferenceCurve = dbConnection.ReferenceCurve;
    let Discrim = dbConnection.Discrim;
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
            Curve.findById(rs.idCurve).then(curve => {
                let response = rs.toJSON();
                if (curve) {
                    asyncLoop(response.reference_curves, function (ref, next) {
                        Curve.findById(ref.idCurve).then(curve => {
                            if (curve) {
                                next();
                            } else {
                                ref.idCurve = null;
                                next();
                            }
                        });
                    }, function () {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
                    });
                } else {
                    response.idCurve = null;
                    asyncLoop(response.reference_curves, function (ref, next) {
                        Curve.findById(ref.idCurve).then(curve => {
                            if (curve) {
                                next();
                            } else {
                                ref.idCurve = null;
                                next();
                            }
                        });
                    }, function () {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
                    });
                    // done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
                }
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram not exists"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    })
}

function editHistogram(histogramInfo, done, dbConnection) {
    delete histogramInfo.createdBy;
    let Histogram = dbConnection.Histogram;
    Histogram.findById(histogramInfo.idHistogram)
        .then(function (histogram) {
            histogramInfo.discriminator = JSON.stringify(histogramInfo.discriminator);
            Object.assign(histogram, histogramInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit histogram success", result));
                })
                .catch(function (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram name existed!"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "histogram not found for edit"));
        })
}

function deleteHistogram(histogramInfo, done, dbConnection) {
    let Histogram = dbConnection.Histogram;
    Histogram.findById(histogramInfo.idHistogram)
        .then(function (histogram) {
            histogram.setDataValue('updatedAt', histogramInfo.updatedBy);
            histogram.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Histogram is deleted", histogram));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Histogram " + err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Histogram not found for delete"))
        })
}

function duplicateHistogram(payload, done, dbConnection) {
    let Histogram = dbConnection.Histogram;
    Histogram.findById(payload.idHistogram).then(hisogram => {
        let newHistogram;
        if (hisogram) {
            newHistogram = hisogram.toJSON();
            delete newHistogram.idHistogram;
            delete newHistogram.createdAt;
            delete newHistogram.updatedAt;
            // newHistogram.name = newHistogram.name + '_' + new Date().toLocaleString('en-US', {timeZone: "Asia/Ho_Chi_Minh"});
            newHistogram.duplicated = 1;
            newHistogram.name = newHistogram.name + "_Copy_" + hisogram.duplicated;
            newHistogram.createdBy = payload.createdBy;
            newHistogram.updatedBy = payload.updatedBy;
            hisogram.duplicated++;
            hisogram.save();
            Histogram.create(newHistogram).then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogram found"));
        }
    });
}

module.exports = {
    createNewHistogram: createNewHistogram,
    getHistogram: getHistogram,
    editHistogram: editHistogram,
    deleteHistogram: deleteHistogram,
    duplicateHistogram: duplicateHistogram
};
