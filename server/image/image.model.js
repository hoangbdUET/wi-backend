// let models = require('../models');
// let Image = models.Image;
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewImage(imageInfo, done, dbConnection) {
    let Image = dbConnection.Image;
    Image.sync()
        .then(function () {
            delete imageInfo.idImage;
            Image.build(imageInfo)
                .save()
                .then(function (image) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new image success", image));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new image " + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        });
}

function editImage(imageInfo, done, dbConnection) {
    let Image = dbConnection.Image;
    Image.findById(imageInfo.idImage)
        .then(function (image) {
            delete imageInfo.idImage;
            delete imageInfo.idTrack;
            Object.assign(image, imageInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit image success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit image" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Image not found for edit"));
        })
}

function deleteImage(imageInfo, done, dbConnection) {
    let Image = dbConnection.Image;
    Image.findById(imageInfo.idImage)
        .then(function (image) {
            image.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Image is deleted", image));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Image not found for delete"));
        });
}

function getImageInfo(imageInfo, done, dbConnection) {
    let Image = dbConnection.Image;
    Image.findById(imageInfo.idImage)
        .then(function (image) {
            if (!image) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get image info success", image));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Image not found for get info"));
        })
}

module.exports = {
    createNewImage: createNewImage,
    editImage: editImage,
    deleteImage: deleteImage,
    getImageInfo: getImageInfo
};
