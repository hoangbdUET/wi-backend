var models = require('../models');
var Image = models.Image;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewImage(imageInfo, done) {
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
function editImage(imageInfo,done) {
    Image.findById(imageInfo.idImage)
        .then(function (image) {
            delete imageInfo.idImage;
            delete imageInfo.idTrack;
            Object.assign(image,imageInfo)
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

function deleteImage(imageInfo,done) {
    Image.findById(imageInfo.idImage)
        .then(function (image) {
            image.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Image is deleted", image));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete image" + err.errors[0].message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Image not found for delete"));
        });
}
function getImageInfo(imageInfo,done) {
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
