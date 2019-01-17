const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

function createImageTemplateSet(payload, cb, dbConnection) {
	dbConnection.ImageTemplateSet.create(payload).then(rs => {
		cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		if (err.name === "SequelizeUniqueConstraintError") {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Template set's name already exists!"));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
		}
	});
}

function infoImageTemplateSet(payload, cb, dbConnection) {
	dbConnection.ImageTemplateSet.findByPk(payload.idImageTemplateSet, {include: [{model: dbConnection.ImageTemplate}, {model: dbConnection.ImageSet}]}).then(rs => {
		if (rs) {
			cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
		} else {
			cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function updateImageTemplateSet(payload, cb, dbConnection) {
	dbConnection.ImageTemplateSet.findByPk(payload.idImageTemplateSet).then(rs => {
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

function deleteImageTemplateSet(payload, cb, dbConnection) {
	dbConnection.ImageTemplateSet.findByPk(payload.idImageTemplateSet).then(rs => {
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

function listImageTemplateSet(payload, cb, dbConnection) {
	dbConnection.ImageTemplateSet.findAll({
		where: {idProject: payload.idProject ? idProject : null},
		include: [{model: dbConnection.ImageSet}, {model: dbConnection.ImageTemplate}]
	}).then(rs => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
	});
}

module.exports = {
	createImageTemplateSet: createImageTemplateSet,
	infoImageTemplateSet: infoImageTemplateSet,
	updateImageTemplateSet: updateImageTemplateSet,
	deleteImageTemplateSet: deleteImageTemplateSet,
	listImageTemplateSet: listImageTemplateSet
};