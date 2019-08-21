const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

function createMlProject(payload, done, dbConnection) {
	dbConnection.MlProject.create(payload).then(rs => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		if (err.name === "SequelizeUniqueConstraintError") {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ML Project's name already exists!"));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
		}
	});
}

function infoMlProject(payload, done, dbConnection) {
	dbConnection.MlProject.findByPk(payload.idMlProject).then(rs => {
		if (rs) {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function deleteMlProject(payload, done, dbConnection) {
	dbConnection.MlProject.findByPk(payload.idMlProject).then(rs => {
		if (rs) {
			rs.destroy().then(() => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function listMlProject(payload, done, dbConnection) {
	if (payload.type) conditions.type = payload.type;
	dbConnection.MlProject.findAll().then(l => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", l));
	})
}

function editMlProject(payload, done, dbConnection) {
	dbConnection.MlProject.findByPk(payload.idMlProject).then(rs => {
		if (rs) {
			Object.assign(rs, payload).save().then((r) => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"))
		}
	})
}

module.exports = {
	createMlProject: createMlProject,
	infoMlProject: infoMlProject,
	deleteMlProject: deleteMlProject,
	listMlProject: listMlProject,
	editMlProject: editMlProject
};