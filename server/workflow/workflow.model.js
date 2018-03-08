"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

let createWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.create(data).then(w => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow name existed!"));
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    });
};

let editWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
            }).catch(err => {

                if (err.name === "SequelizeUniqueConstraintError") {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow name existed!"));
                } else {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                }
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let infoWorkflow = function (data, callback, dbConnection) {
    dbConnection.Workflow.findById(data.idWorkflow).then(async w => {
        if (w) {
            w = w.toJSON();
            w.workflowspec = {};
            if (w.idWorkflowSpec) {
                w.workflowspec = await dbConnection.WorkflowSpec.findById(w.idWorkflowSpec);
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
            } else {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
            }
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