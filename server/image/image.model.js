// let models = require('../models');
// let Image = models.Image;
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewImage(imageInfo, done, dbConnection) {
	dbConnection.Image.create(imageInfo).then(i => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", i));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function editImage(imageInfo, done, dbConnection) {
	dbConnection.Image.findByPk(imageInfo.idImage).then(img => {
		if (img) {
			Object.assign(img, imageInfo).save().then((i) => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", i));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			})
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No image found by id"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function deleteImage(imageInfo, done, dbConnection) {
	dbConnection.Image.findByPk(imageInfo.idImage).then(img => {
		if (img) {
			img.destroy().then(i => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", i));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			})
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No image found by id"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function getImageInfo(imageInfo, done, dbConnection) {
	dbConnection.Image.findByPk(imageInfo.idImage).then(i => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", i));
	});
}

module.exports = {
	createNewImage: createNewImage,
	editImage: editImage,
	deleteImage: deleteImage,
	getImageInfo: getImageInfo
};
