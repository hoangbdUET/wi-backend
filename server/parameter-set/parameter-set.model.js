const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

let createNewParameterSet = function (data, done, dbConnection) {
    dbConnection.ParameterSet.create(data).then(p => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", p));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
};
let listParameterSet = function (data, done, dbConnection) {
    dbConnection.ParameterSet.findAll({where: {idProject: data.idProject}}).then(ps => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", ps));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.SUCCESS, err.message, []));
    });
};
let infoParameterSet = function (data, done, dbConnection) {
    dbConnection.ParameterSet.findById(data.idParameterSet).then(p => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", p));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err));
    });
};
let deleteParameterSet = function (data, done, dbConnection) {
    dbConnection.ParameterSet.findById(data.idParameterSet).then(p => {
        if (p) {
            p.destroy().then(() => {
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
let updateParameterSet = function (data, done, dbConnection) {
    dbConnection.ParameterSet.findById(data.idParameterSet).then(p => {
        if (p) {
            Object.assign(p, data).save().then(e => {
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

module.exports = {
    createNewParameterSet: createNewParameterSet,
    listParameterSet: listParameterSet,
    infoParameterSet: infoParameterSet,
    deleteParameterSet: deleteParameterSet,
    updateParameterSet: updateParameterSet
};