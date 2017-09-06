"use strict";
var models = require('../models');
var Marker = models.Marker;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewMarker(markerInfo, done) {
    Marker.create(markerInfo).then(result => {
        Marker.findById(result.idMarker).then(marker => {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Marker success", marker));
        });
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Marker error", err.message));
    });
}

function getMarkerInfo(markerID, done) {
    Marker.findById(markerID.idMarker, {
        include: [{all: true}]
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    })
}

function editMarker(markerInfo, done) {
    Marker.findById(markerInfo.idMarker)
        .then(function (marker) {
            Object.assign(marker, markerInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Marker success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Marker" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Marker not found for edit"));
        })
}

function deleteMarker(markerInfo, done) {
    Marker.findById(markerInfo.idMarker)
        .then(function (marker) {
            marker.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Marker is deleted", marker));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Marker " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Marker not found for delete"))
        })
}

module.exports = {
    createNewMarker: createNewMarker,
    getMarkerInfo: getMarkerInfo,
    editMarker: editMarker,
    deleteMarker: deleteMarker
}

