const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const config = require('config');

function createNewStorageDatabase(payload, dbConnection, done) {
	dbConnection.StorageDatabase.create(payload).then(rs => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function infoStorageDatabase(payload, dbConnection, done) {
	dbConnection.StorageDatabase.findById(payload.idStorageDatabase).then(rs => {
		if (rs) {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not Found"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function deleteStorageDatabase(payload, dbConnection, done) {
	dbConnection.StorageDatabase.findById(payload.idStorageDatabase).then(rs => {
		if (rs) {
			rs.destroy().then(r => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not Found"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function listStorageDatabase(payload, dbConnection, done) {
	dbConnection.StorageDatabase.findAll({where: {idProject: payload.idProject}}).then(rs => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	});
}

function listStorageDatabaseByUser(payload, dbConnection, done) {
	const sequelize = require('sequelize');
	let query = "SELECT * FROM `" + config.Database.prefix + payload.username + "`.storage_database WHERE idProject = " + payload.idProject;
	dbConnection.sequelize.query(query, {type: sequelize.QueryTypes.SELECT}).then(rs => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
	}).catch(err => {
		console.log("LOI : ", query);
		done(ResponseJSON(ErrorCodes.SUCCESS, "Error", []));
	});
}

module.exports = {
	createNewStorageDatabase: createNewStorageDatabase,
	infoStorageDatabase: infoStorageDatabase,
	listStorageDatabase: listStorageDatabase,
	deleteStorageDatabase: deleteStorageDatabase,
	listStorageDatabaseByUser: listStorageDatabaseByUser
};