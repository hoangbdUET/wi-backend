const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

function createImageTemplate(payload, cb, dbConnection) {
	dbConnection.ImageTemplate.create(payload).then(rs => {
		cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		if (err.name === "SequelizeUniqueConstraintError") {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Template's name already exists!"));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
		}
	});
}

function infoImageTemplate(payload, cb, dbConnection) {
	dbConnection.ImageTemplate.findById(payload.idImageTemplate).then(rs => {
		if (rs) {
			cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function updateImageTemplate(payload, cb, dbConnection) {
	dbConnection.ImageTemplate.findById(payload.idImageTemplate).then(rs => {
		if (rs) {
			Object.assign(rs, payload).save().then(r => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			});
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function deleteImageTemplate(payload, cb, dbConnection) {
	dbConnection.ImageTemplate.findById(payload.idImageTemplate).then(rs => {
		if (rs) {
			rs.destroy().then(() => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			})
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

module.exports = {
	createImageTemplate: createImageTemplate,
	infoImageTemplate: infoImageTemplate,
	updateImageTemplate: updateImageTemplate,
	deleteImageTemplate: deleteImageTemplate
};