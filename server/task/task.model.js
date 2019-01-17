"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');

let createTask = function (data, callback, dbConnection) {
    if (!data.idTaskSpec) {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "idTaskSpec can not be null", "idTaskSpec can not be null"));
    } else {
        dbConnection.Task.create(data).then(w => {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
        }).catch(err => {
            if (err.name === "SequelizeUniqueConstraintError") {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Task's name already exists!"));
            } else {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    }
};

let editTask = function (data, callback, dbConnection) {
    delete data.createdBy;
    dbConnection.Task.findByPk(data.idTask).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                if (err.name === "SequelizeUniqueConstraintError") {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Task's name already exists!"));
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
    dbConnection.Task.findByPk(data.idTask).then(async w => {
        if (w) {
            w = w.toJSON();
            w.taskspec = {};
            if (w.idTaskSpec) {
                w.taskspec = await dbConnection.TaskSpec.findByPk(w.idTaskSpec);
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            } else {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            }
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No task found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};


let deleteTask = function (data, callback, dbConnection) {
    dbConnection.Task.findByPk(data.idTask).then(w => {
        if (w) {
            w.destroy().then(() => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No task found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

module.exports = {
    createTask: createTask,
    editTask: editTask,
    infoTask: infoTask,
    deleteTask: deleteTask
};