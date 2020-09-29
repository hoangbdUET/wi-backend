const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const fs = require('fs');
const wiLog = require('@revotechuet/wi-logger');
const logger = new wiLog('./logs');
let createNewParameterSet = function (data, done, dbConnection, CurrentProject) {
	dbConnection.ParameterSet.findOrCreate({
		where: {
			idProject: data.idProject,
			name: data.name,
			type: data.type
		},
		defaults: data
	}).then(rs => {
		if (rs[1]) {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs[0]));
			logger.info({message: "Created new " + data.type + " " + data.name, username: data.updatedBy, project: CurrentProject});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Parameter set already exists", rs[0]));
		}
	}).catch(err => {
		logger.error({message: err, username: data.updatedBy, project: CurrentProject});
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
	});
};
let listParameterSet = function (data, done, dbConnection) {
	let conditions = data.idTaskSpec ? {
		idProject: data.idProject,
		idTaskSpec: data.idTaskSpec,
	} : {idProject: data.idProject};
	data.type ? conditions.type = data.type : null;
	dbConnection.ParameterSet.findAll({where: conditions}).then(ps => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", ps));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.SUCCESS, err.message, []));
	});
};
let infoParameterSet = function (data, done, dbConnection) {
	dbConnection.ParameterSet.findByPk(data.idParameterSet).then(p => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", p));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err));
	});
};
let deleteParameterSet = function (data, done, dbConnection, CurrentProject) {
	dbConnection.ParameterSet.findByPk(data.idParameterSet).then(p => {
		if (p) {
			p.destroy().then(() => {
				logger.info({message: "Deleted " + p.type + " " + p.name, username: p.updatedBy, project: CurrentProject});
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", p));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No parameter set found by id"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
};
let updateParameterSet = function (data, done, dbConnection, CurrentProject) {
	dbConnection.ParameterSet.findByPk(data.idParameterSet).then(p => {
		if (p) {
			Object.assign(p, data).save().then(e => {
				logger.info({message: "Updated " + e.type + " " + e.name, username: data.updatedBy, project: CurrentProject});
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", e));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No parameter set found by id"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
};

function downloadParameterSet(payload, done, dbConnection) {
	if (payload.idParameterSet) {
		dbConnection.ParameterSet.findByPk(payload.idParameterSet).then(p => {
			if (p) {
				let tempfile = require('tempfile')('.json');
				fs.writeFileSync(tempfile, JSON.stringify({
					name: p.name,
					type: p.type,
					content: p.content,
					node: p.note,
					idTaskSpec: p.idTaskSpec,
					idParameterSet: p.idParameterSet
				}));
				done(null, tempfile);
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No params found by id"));
			}
		})
	} else if (payload.type) {
		dbConnection.ParameterSet.findAll({where: {type: payload.type}}).then(ps => {
			if (ps) {
				let tempfile = require('tempfile')('.json');
				fs.writeFileSync(tempfile, JSON.stringify(ps.toJSON()));
				done(null, tempfile);
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No params found by id"));
			}
		})
	} else {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need id or type"));
	}
}

module.exports = {
	createNewParameterSet: createNewParameterSet,
	listParameterSet: listParameterSet,
	infoParameterSet: infoParameterSet,
	deleteParameterSet: deleteParameterSet,
	updateParameterSet: updateParameterSet,
	downloadParameterSet: downloadParameterSet
};
