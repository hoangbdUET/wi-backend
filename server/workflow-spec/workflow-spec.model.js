"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

let createWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.create(data).then(w => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let editWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findById(data.idWorkflowSpec).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow spec found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let infoWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findById(data.idWorkflowSpec, {include: {all: true}}).then(w => {
        if (w) {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow spec found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let deleteWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findById(data.idWorkflowSpec).then(w => {
        if (w) {
            w.destroy().then(() => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow spec found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let listWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findAll().then(w => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

module.exports = {
    createWorkflowSpec: createWorkflowSpec,
    editWorkflowSpec: editWorkflowSpec,
    infoWorkflowSpec: infoWorkflowSpec,
    deleteWorkflowSpec: deleteWorkflowSpec,
    listWorkflowSpec: listWorkflowSpec
};