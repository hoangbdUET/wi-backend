var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createObjectTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectTrack;
    Model.create(info).then(result => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful ObjectTrack", result));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function infoObjectTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectTrack;
    Model.findById(info.idObjectTrack, {include: {all: true}}).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ObjectTrack Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function editObjectTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectTrack;
    Model.findById(info.idObjectTrack).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ObjectTrack Found"));
        } else {
            Object.assign(result, info).save().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful ObjectTrack", info));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err"));
            })
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function deleteObjectTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectTrack;
    Model.destroy({where: {idObjectTrack: info.idObjectTrack}}).then(result => {
        if (result > 0) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Delete ObjectTrack successful", info));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found ObjectTrack for delete"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

module.exports = {
    createObjectTrack: createObjectTrack,
    infoObjectTrack: infoObjectTrack,
    deleteObjectTrack: deleteObjectTrack,
    editObjectTrack: editObjectTrack
}