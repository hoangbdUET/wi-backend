"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewMarker(markerInfo, done, dbConnection) {
    let Marker = dbConnection.Marker;
    Marker.create(markerInfo).then(result => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Marker success", result));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Marker error", err));
    });
}

function getMarkerInfo(markerID, done, dbConnection) {
    let Marker = dbConnection.Marker;
    Marker.findByPk(markerID.idMarker, {
        include: [{all: true}]
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    })
}

function editMarker(markerInfo, done, dbConnection) {
    delete markerInfo.createdBy;
    let Marker = dbConnection.Marker;
    Marker.findByPk(markerInfo.idMarker)
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

function deleteMarker(markerInfo, done, dbConnection) {
    let Marker = dbConnection.Marker;
    Marker.findByPk(markerInfo.idMarker)
        .then(function (marker) {
            marker.setDataValue('updatedAt', markerInfo.updatedBy);
            marker.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Marker is deleted", marker));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
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

