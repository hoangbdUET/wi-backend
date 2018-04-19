"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');

let createTask = function (data, callback, dbConnection) {
    if (!data.idTaskSpec) {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "idTaskSpec can not be null", "idTaskSpec can not be null"));
    } else {
        dbConnection.Task.create(data).then(w => {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", w));
        }).catch(err => {
            if (err.name === "SequelizeUniqueConstraintError") {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Task name existed!"));
            } else {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    }
};

let editTask = function (data, callback, dbConnection) {
    delete data.createdBy;
    dbConnection.Task.findById(data.idTask).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
            }).catch(err => {
                if (err.name === "SequelizeUniqueConstraintError") {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Task name existed!"));
                } else {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                }
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Task found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
    });
};


let infoTask = function (data, callback, dbConnection) {
    dbConnection.Workflow.findById(data.idTask).then(async w => {
        if (w) {
            w = w.toJSON();
            w.taskspec = {};
            if (w.idTaskSpec) {
                w.taskspec = await dbConnection.WorkflowSpec.findById(w.idTaskSpec);
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


let deleteTask = function (data, callback, dbConnection) {
    dbConnection.Task.findById(data.idTask).then(w => {
        if (w) {
            w.setDataValue('updatedBy', data.updatedBy);
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

let listTask = function (data, callback, dbConnection) {
    let res = [];
    dbConnection.Task.findAll({where: {idProject: data.idProject}}).then(w => {
        async.each(w, function (wf, next) {
            wf = wf.toJSON();
            dbConnection.TaskSpec.findById(wf.idTaskSpec).then(ws => {
                wf.taskSpec = {
                    name: ws.name,
                    idTaskSpec: ws.idTaskSpec,
                    type: ws.type
                };
                delete wf.idTaskSpec;
                res.push(wf);
                next();
            });
        }, function () {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", res));
        });
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

module.exports = {
    createTask: createTask,
    editTask: editTask,
    infoTask: infoTask,
    deleteTask: deleteTask,
    listTask: listTask
};