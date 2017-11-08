var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createImageOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageOfTrack;
    Model.create(info).then(result => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function infoImageOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageOfTrack;
    Model.findById(info.idImageOfTrack).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Image Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function editImageOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageOfTrack;
    Model.findById(info.idImageOfTrack).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Image Found"));
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

function deleteImageOfTrack(info, done, dbConnection) {
    let Model = dbConnection.ImageOfTrack;
    Model.destroy({where: {idImageOfTrack: info.idImageOfTrack}}).then(result => {
        if (result > 0) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", info));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found for delete"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function getListImage(imageInfo, done, dbConnection) {
    var Model = dbConnection.ImageOfTrack;
    Model.findAll({where: {idImageTrack: imageInfo.idImageTrack}}).then(images => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Get image success", images));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Cant get list", err.message));
    });
}
module.exports = {
    createImageOfTrack: createImageOfTrack,
    infoImageOfTrack: infoImageOfTrack,
    editImageOfTrack: editImageOfTrack,
    deleteImageOfTrack: deleteImageOfTrack,
    getListImage: getListImage
}