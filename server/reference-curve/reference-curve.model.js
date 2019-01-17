"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewReferenceCurve(info, callback, dbConnection) {
    let ReferenceCurve = dbConnection.ReferenceCurve;
    ReferenceCurve.create(info).then(referenceCurve => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Create new reference successful!", referenceCurve));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new reference error!", err.stack));
    });
}

function infoReferenceCurve(info, callback, dbConnection) {
    let ReferenceCurve = dbConnection.ReferenceCurve;
    ReferenceCurve.findByPk(info.idReferenceCurve, {
        include: [dbConnection.Curve]
    }).then(referenceCurve => {
        if (referenceCurve) {
            dbConnection.Curve.findByPk(referenceCurve.idCurve).then(curve => {
                if (curve) {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Get info reference successful!", referenceCurve));
                } else {
                    referenceCurve.idCurve = null;
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Get info reference successful!", referenceCurve));
                }
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "NO REFERENCE CURVE FOUND!"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Get info reference error!", err.message));
    });
}

function editReferenceCurve(info, callback, dbConnection) {
    delete info.createdBy;
    let ReferenceCurve = dbConnection.ReferenceCurve;
    ReferenceCurve.findByPk(info.idReferenceCurve).then(referenceCurve => {
        Object.assign(referenceCurve, info)
            .save()
            .then(function (result) {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Edit reference success", result));
            })
            .catch(function (err) {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit reference error" + err));
            })
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Get info reference error!", err.message));
    });
}

function deleteReferenceCurve(info, callback, dbConnection) {
    let ReferenceCurve = dbConnection.ReferenceCurve;
    ReferenceCurve.findByPk(info.idReferenceCurve)
        .then(function (referenceCurve) {
            referenceCurve.setDataValue('updatedBy', info.updatedBy);
            referenceCurve.destroy()
                .then(function () {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Reference is deleted", referenceCurve));
                })
                .catch(function (err) {
                    callback(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete reference error " + err.message, err.message));
                })
        })
        .catch(function () {
            callback(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Reference curve not found for delete"))
        })
}

function listReferenceCurve(info, callback, dbConnection) {
    let ReferenceCurve = dbConnection.ReferenceCurve;
    ReferenceCurve.findAll().then(rs => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "list", rs));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "err", err));
    });
}

module.exports = {
    createNewReferenceCurve: createNewReferenceCurve,
    infoReferenceCurve: infoReferenceCurve,
    deleteReferenceCurve: deleteReferenceCurve,
    editReferenceCurve: editReferenceCurve,
    listReferenceCurve: listReferenceCurve
}
