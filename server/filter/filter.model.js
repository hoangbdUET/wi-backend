let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function create(info, done, dbConnection) {
	dbConnection.Filter.create(info).then(info => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Generic Object Track success", info));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, err.message, err.message));
	});
}

function edit(info, done, dbConnection) {
	delete info.createdBy;
	let Model = dbConnection.Filter;
	Model.findByPk(info.idFilter)
		.then(function (result) {
			Object.assign(result, info).save()
				.then(function () {
					done(ResponseJSON(ErrorCodes.SUCCESS, "Edit filter success", info));
				})
				.catch(function (err) {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Filter not found for edit"))
		});
}

function deleteFilter(info, done, dbConnection) {
	let Model = dbConnection.Filter;
	Model.findByPk(info.idFilter)
		.then(function (result) {
			result.setDataValue('updatedBy', info.updatedBy);
			result.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", result));
            });
		})
		.catch(function (err) {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Filter not found for delete"));
		})
}

function getInfo(info, done, dbConnection) {
	let Model = dbConnection.Filter;
    Model.findByPk(info.idFilter).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Filter Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

function listFilter(info, done, dbConnection) {
    let Model = dbConnection.Filter;
    Model.findAll({}).then((rs)=>{
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    })
    .catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

module.exports = {
    create: create,
    info: getInfo,
    edit: edit,
    deleteFilter: deleteFilter,
    list: listFilter
}