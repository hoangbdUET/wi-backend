"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

let createWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.create(data).then(w => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let editWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let infoWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let deleteWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            w.destroy().then(() => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let listWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.findAll().then(w => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

module.exports = {
    createWorkflow: createWorkflow,
    editWorkflow: editWorkflow,
    infoWorkflow: infoWorkflow,
    deleteWorkflow: deleteWorkflow,
    listWorkflow: listWorkflow
};