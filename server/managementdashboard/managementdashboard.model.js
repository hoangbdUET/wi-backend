const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const async = require('async');

function createNew(payload, done, dbConnection) {
    dbConnection.ManagementDashboard.create(payload)
    .then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, 'create management dashboard successfully', rs));
    })
    .catch(e=>{
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, e.message, {}));
    });
}

function edit(payload, done, dbConnection) {
	dbConnection.ManagementDashboard.findByPk(payload.idManagementDashboard).then(m => {
		if (m) {
			Object.assign(m, payload).save().then((rs)=>{
				done(ResponseJSON(ErrorCodes.SUCCESS, 'edit management dashboard successfully', rs));
			});
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function del(payload, done, dbConnection) {
	dbConnection.ManagementDashboard.destroy({where: {idManagementDashboard: payload.idManagementDashboard}}).then(r => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function list(payload, done, dbConnection) {
	dbConnection.ManagementDashboard.findAll({
	}).then(r => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function info(payload, done, dbConnection) {
	dbConnection.ManagementDashboard.findByPk(payload.idManagementDashboard).then(r => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

module.exports = {
	create: createNew,
	edit: edit,
	delete: del,
	list: list,
	info: info
};
