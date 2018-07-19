"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');
let fs = require('fs-extra');
let hashDir = require('wi-import').hashDir;
let config = require('config');

let createWorkflow = function (data, callback, dbConnection, username) {
    let contentTmpPath = data.content;
    data.content = '{}';
    if (!data.idWorkflowSpec) {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "idWorkflowSpec can not be null", "idWorkflowSpec can not be null"));
    } else {
        dbConnection.Workflow.create(data).then(w => {
            let savePath = hashDir.createPath(config.curveBasePath, 'WORKFLOW' + username + w.name, w.name + '.txt');
            fs.copy(contentTmpPath, savePath, function (err) {
                if (err) {
                    fs.unlinkSync(contentTmpPath);
                    console.log("Err copy workflow content ", err);
                }
                console.log("Copy workflow content file success! ", savePath);
                fs.unlinkSync(contentTmpPath);
                w.content = JSON.parse(fs.readFileSync(savePath).toString());
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            });
        }).catch(err => {
            if (err.name === "SequelizeUniqueConstraintError") {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow name existed!"));
            } else {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    }
};

let editWorkflow = function (data, callback, dbConnection, username) {
    delete data.createdBy;
    let contentTmpPath = data.content;
    data.content = '{}';
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            Object.assign(w, data).save().then(rs => {
                let oldSavePath = hashDir.createPath(config.curveBasePath, 'WORKFLOW' + username + w.name, w.name + '.txt');
                let newSavePath = hashDir.createPath(config.curveBasePath, 'WORKFLOW' + username + rs.name, rs.name + '.txt');
                fs.copy(contentTmpPath, newSavePath, function (err) {
                    if (err) {
                        fs.unlinkSync(contentTmpPath);
                        console.log("Err copy workflow content ", err);
                    }
                    if (oldSavePath !== newSavePath) fs.unlinkSync(oldSavePath);
                    console.log("Copy workflow content file success! ", newSavePath);
                    fs.unlinkSync(contentTmpPath);
                    rs.content = JSON.parse(fs.readFileSync(newSavePath).toString());
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
                });
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


let infoWorkflow = function (data, callback, dbConnection, username) {
    dbConnection.Workflow.findById(data.idWorkflow).then(async w => {
        if (w) {
            let savePath = hashDir.createPath(config.curveBasePath, 'WORKFLOW' + username + w.name, w.name + '.txt');
            w = w.toJSON();
            w.content = JSON.parse(fs.readFileSync(savePath).toString());
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


let deleteWorkflow = function (data, callback, dbConnection, username) {
    dbConnection.Workflow.findById(data.idWorkflow).then(w => {
        if (w) {
            let savePath = hashDir.createPath(config.curveBasePath, 'WORKFLOW' + username + w.name, w.name + '.txt');
            w.setDataValue('updatedBy', data.updatedBy);
            w.destroy().then(() => {
                fs.unlinkSync(savePath);
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", w));
            });
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found by id"));
        }
    }).catch(err => {
        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
};

let listWorkflow = function (data, callback, dbConnection, username) {
    let res = [];
    dbConnection.Workflow.findAll({where: {idProject: data.idProject}}).then(w => {
        async.each(w, function (wf, next) {
            wf = wf.toJSON();
            let savePath = hashDir.createPath(config.curveBasePath, 'WORKFLOW' + username + wf.name, wf.name + '.txt');
            wf.content = JSON.parse(fs.readFileSync(savePath).toString());
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