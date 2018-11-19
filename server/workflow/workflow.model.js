"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');

let createWorkflow = function (data, callback, dbConnection) {
    if (!data.idWorkflowSpec) {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "idWorkflowSpec can not be null", "idWorkflowSpec can not be null"));
    } else {
        dbConnection.Workflow.create(data).then(w => {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
        }).catch(err => {
            if (err.name === "SequelizeUniqueConstraintError") {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow's name already exists"));
            } else {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    }
};

let editWorkflow = function (data, callback, dbConnection) {
    delete data.createdBy;
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {

                if (err.name === "SequelizeUniqueConstraintError") {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow's name already exists"));
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
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            } else {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
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
            w.setDataValue('updatedBy', data.updatedBy);
            w.destroy().then(() => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let listWorkflow = function (data, callback, dbConnection) {
    let res = [];
    dbConnection.Workflow.findAll({where: {idProject: data.idProject}}).then(w => {
        async.each(w, function (wf, next) {
            wf = wf.toJSON();
            dbConnection.WorkflowSpec.findById(wf.idWorkflowSpec).then(ws => {
                wf.workflowSpec = {
                    name: ws.name,
                    idWorkflowSpec: ws.idWorkflowSpec,
                    type: ws.type
                };
                delete wf.idWorkflowSpec;
                res.push(wf);
                next();
            });
        }, function () {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", res));
        });


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