"use strict";
var models = require('../models');
var Histogram = models.Histogram;
var Zone = models.Zone;
var ZoneSet = models.ZoneSet;
var Curve = models.Curve;
var Well = models.Well;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewHistogram(histogramInfo, done, dbConnection) {
    var Histogram = dbConnection.Histogram;
    var Well = dbConnection.Well;
    Well.findById(parseInt(histogramInfo.idWell)).then(well => {
        histogramInfo.referenceTopDepth = well.topDepth;
        histogramInfo.referenceBottomDepth = well.bottomDepth;
        if (histogramInfo.idZoneSet) {
            Histogram.create(histogramInfo).then(result => {
                Histogram.findById(result.idHistogram).then(his => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
                });
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new histogram error", err.message));
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
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new histogram error", err.errors));
                });

            } else {
                Histogram.create(histogramInfo).then(result => {
                    Histogram.findById(result.idHistogram).then(his => {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
                    });
                }).catch(err => {
                    // console.log(err);
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new histogram error", err.errors));
                });
            }
        }
    }).catch(err => {

    });
}

function getHistogram(histogramId, done, dbConnection) {
    var Histogram = dbConnection.Histogram;
    var Curve = dbConnection.Curve;
    var ZoneSet = dbConnection.ZoneSet;
    var Zone = dbConnection.Zone;
    var ReferenceCurve = dbConnection.ReferenceCurve;
    Histogram.findById(histogramId.idHistogram, {
        include: [{
            model: ZoneSet,
            include: [{model: Zone}]
        }, {
            model: Curve
        }, {
            model: ReferenceCurve
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
