var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

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
    Model.destroy({where: {idImageTrack: info.idImageTrack}}).then(result => {
        console.log(result);
        if (result > 0) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", info));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found ImageTrack for delete"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

module.exports = {
    createImageTrack: createImageTrack,
    infoImageTrack: infoImageTrack,
    editImageTrack: editImageTrack,
    deleteImageTrack: deleteImageTrack
}