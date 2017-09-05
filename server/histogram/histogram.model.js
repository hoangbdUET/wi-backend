"use strict";
var models = require('../models');
var Histogram = models.Histogram;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewHistogram(histogramInfo, done) {
    Histogram.create(histogramInfo).then(result => {
        Histogram.findById(result.idHistogram).then(his => {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
        });
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new histogram error", err.message));
    });
}

function getAllHistogram(done) {
    Histogram.findAll().then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Failed", err.message));
    });
}

function getHistogram(histogramId, done) {
    Histogram.findById(histogramId.idHistogram, {include: [{all: true}]}).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    })
}

module.exports = {
    createNewHistogram: createNewHistogram,
    getAllHistogram: getAllHistogram,
    getHistogram: getHistogram

};