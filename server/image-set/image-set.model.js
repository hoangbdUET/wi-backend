const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

function createImageSet(payload, cb, dbConnection, logger) {
	dbConnection.ImageSet.create(payload).then(rs => {
		logger.info("IMAGE_SET", rs.idImageSet, "Created");
		cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		if (err.name === "SequelizeUniqueConstraintError") {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Image set's name already exists!"));
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
		}
	});
}

function createOrGetImageSet(payload, cb, dbConnection, logger) {
	dbConnection.ImageSet.findOrCreate({
		where: {
			name: payload.name,
			idWell: payload.idWell
		}, defaults: payload
	}).then(rs => {
		cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs[0]));
	}).catch(err => {
		cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
	});
}

function infoImageSet(payload, cb, dbConnection) {
	dbConnection.ImageSet.findByPk(payload.idImageSet, {include: {model: dbConnection.Image}}).then(rs => {
		if (rs) {
			cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function updateImageSet(payload, cb, dbConnection, logger) {
	dbConnection.ImageSet.findByPk(payload.idImageSet).then(rs => {
		if (rs) {
			Object.assign(rs, payload).save().then(r => {
				logger.info("IMAGE_SET", r.idImageSet, "Updated");
				cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
			}).catch(err => {
				cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			});
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function deleteImageSet(payload, cb, dbConnection, logger) {
	dbConnection.ImageSet.findByPk(payload.idImageSet).then(rs => {
		if (rs) {
			rs.destroy().then(() => {
				logger.info("IMAGE_SET", rs.idImageSet, "Deleted");
				cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
			}).catch(err => {
				cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			})
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function duplicateImageSet(payload, cb, dbConnection) {
	cb(ResponseJSON(ErrorCodes.SUCCESS, "Not Implemented"));
}

function listImageSet(payload, cb, dbConnection) {
	dbConnection.ImageSet.findAll({
		where: {idWell: payload.idWell},
		include: {model: dbConnection.Image}
	}).then(rs => {
		cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
	});
}

module.exports = {
	createImageSet: createImageSet,
	createOrGetImageSet: createOrGetImageSet,
	infoImageSet: infoImageSet,
	updateImageSet: updateImageSet,
	deleteImageSet: deleteImageSet,
	duplicateImageSet: duplicateImageSet,
	listImageSet: listImageSet
};
