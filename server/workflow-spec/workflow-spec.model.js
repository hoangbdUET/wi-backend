"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let masterWorkflowSpec = require('../models-master').WorkflowSpec;
let asyncLoop = require('async/each');
let userModel = require('../models');
let config = require('config');

let createWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.create(data).then(w => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow Spec's name already exists"));
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    });
};

let editWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findByPk(data.idWorkflowSpec).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                if (err.name === "SequelizeUniqueConstraintError") {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow Spec's name already exists"));
                } else {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                }
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow spec found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let infoWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findByPk(data.idWorkflowSpec, {include: {all: true}}).then(w => {
        if (w) {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow spec found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let deleteWorkflowSpec = function (data, callback, dbConnection) {
    dbConnection.WorkflowSpec.findByPk(data.idWorkflowSpec).then(w => {
        if (w) {
            w.destroy().then(() => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
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
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let syncWorkflowSpec = function (username, callback) {
    let userDbConnection = userModel(config.Database.prefix + username, function (err) {
        if (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        }
    });
    userDbConnection.WorkflowSpec.destroy({where: {}}).then(() => {
        masterWorkflowSpec.findAll().then(globalWorkflowSpecs => {
            asyncLoop(globalWorkflowSpecs, function (globalWorkflowSpec, next) {
                globalWorkflowSpec = globalWorkflowSpec.toJSON();
                userDbConnection.WorkflowSpec.create(globalWorkflowSpec).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next(err);
                });
            }, function (err) {
                if (err) console.log(err);
                callback(null, "DONE ALL GLOBAL WORKFLOW SPEC");
            });
        }).catch(err => {
            console.log(err);
            callback(err, null);
        });
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
};

module.exports = {
    createWorkflowSpec: createWorkflowSpec,
    editWorkflowSpec: editWorkflowSpec,
    infoWorkflowSpec: infoWorkflowSpec,
    deleteWorkflowSpec: deleteWorkflowSpec,
    listWorkflowSpec: listWorkflowSpec,
    syncWorkflowSpec: syncWorkflowSpec
};