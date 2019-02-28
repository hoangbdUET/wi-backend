const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

function createAnalysis(payload, done, dbConnection) {
	dbConnection.Analysis.create(payload).then(rs => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function infoAnalysis(payload, done, dbConnection) {
	dbConnection.Analysis.findByPk(payload.idAnalysis).then(rs => {
		if (rs) {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not found"));
		}
	});
}

function deleteAnalysis(payload, done, dbConnection) {
	dbConnection.Analysis.findByPk(payload.idAnalysis).then(rs => {
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

function listAnalysis(payload, done, dbConnection) {
	let conditions = {
		idProject: payload.idProject
	};
	if (payload.type) conditions.type = payload.type;
	dbConnection.Analysis.findAll({where: conditions}).then(l => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", l));
	})
}

function editAnalysis(payload, done, dbConnection) {
	dbConnection.Analysis.findByPk(payload.idAnalysis).then(rs => {
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
	createAnalysis: createAnalysis,
	infoAnalysis: infoAnalysis,
	deleteAnalysis: deleteAnalysis,
	listAnalysis: listAnalysis,
	editAnalysis: editAnalysis
};