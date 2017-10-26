var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createObjectOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectOfTrack;
    Model.create(info).then(result => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful ObjectOfTrack", result));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function infoObjectOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectOfTrack;
    Model.findById(info.idObjectOfTrack).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ObjectOfTrack Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function editObjectOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectOfTrack;
    Model.findById(info.idObjectOfTrack).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ObjectOfTrack Found"));
        } else {
            Object.assign(result, info).save().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", info));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err"));
            })
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function deleteObjectOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ObjectOfTrack;
    Model.destroy({where: {idObjectOfTrack: info.idObjectOfTrack}}).then(result => {
        if (result > 0) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", info));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found ObjectOfTrack for delete"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

module.exports = {
    createObjectOfTrack: createObjectOfTrack,
    infoObjectOfTrack: infoObjectOfTrack,
    editObjectOfTrack: editObjectOfTrack,
    deleteObjectOfTrack: deleteObjectOfTrack
}