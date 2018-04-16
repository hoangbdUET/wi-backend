let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createImageTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageTrack;
    Model.create(info).then(result => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function infoImageTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageTrack;
    Model.findById(info.idImageTrack, {include: {all: true}}).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ImageTrack Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function editImageTrack(info, done, dbConnection) {
    delete info.createdBy;
    let Model = dbConnection.ImageTrack;
    Model.findById(info.idImageTrack).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ImageTrack Found"));
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

function deleteImageTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageTrack;
    Model.findOne({where: {idImageTrack: info.idImageTrack}}).then(track => {
        if (track) {
            track.setDataValue('updatedBy', info.updatedBy);
            track.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", info));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No track found by id"));
        }
    });
}

module.exports = {
    createImageTrack: createImageTrack,
    infoImageTrack: infoImageTrack,
    editImageTrack: editImageTrack,
    deleteImageTrack: deleteImageTrack
}