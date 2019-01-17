let masterTaskSpec = require('../models-master').TaskSpec;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');
let userModel = require('../models');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let config = require('config');

let syncTaskSpec = function (username, callback) {
    let userDbConnection = userModel(config.Database.prefix + username, function (err) {
        if (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        }
    });
    userDbConnection.TaskSpec.destroy({where: {}}).then(() => {
        masterTaskSpec.findAll().then(gs => {
            async.each(gs, function (g, next) {
                g = g.toJSON();
                userDbConnection.TaskSpec.create(g).then(() => {
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
        callback(err, null);
    });
};

let createTaskSpec = function (callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'task-spec.xlsx'), 'task-spec').splice(1);
    async.each(rows, function (row, nextRow) {
        masterTaskSpec.create({
            idTaskSpec: row[0],
            name: row[1],
            group: row[2],
            content: row[3],
            description: row[4],
            type: row[5] === '' ? 0 : row[5]
        }).then(() => {
            nextRow();
        }).catch(err => {
            nextRow();
        })
    }, function () {
        console.log("Done all task-spec");
        callback();
    });
};

function addTaskSpec(payload, done, dbConnection) {
    dbConnection.TaskSpec.create(payload).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
    });
}

function infoTaskSpec(payload, done, dbConnection) {
    dbConnection.TaskSpec.findByPk(payload.idTaskSpec).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    });
}

function listTaskSpec(payload, done, dbConnection) {
    dbConnection.TaskSpec.findAll().then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
    });
}

function deleteTaskSpec(payload, done, dbConnection) {
    dbConnection.TaskSpec.findByPk(payload.idTaskSpec).then(r => {
        if (r) {
            r.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No taskspec found by id"));
        }
    });
}

function editTaskSpec(payload, done, dbConnection) {
    dbConnection.TaskSpec.findByPk(payload.idTaskSpec).then(r => {
        if (r) {
            Object.assign(r, payload).save().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No taskspec found by id"));
        }
    });
}

module.exports = {
    createTaskSpec: createTaskSpec,
    syncTaskSpec: syncTaskSpec,
    addTaskSpec: addTaskSpec,
    infoTaskSpec: infoTaskSpec,
    listTaskSpec: listTaskSpec,
    deleteTaskSpec: deleteTaskSpec,
    editTaskSpec: editTaskSpec
};