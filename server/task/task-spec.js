let masterTaskSpec = require('../models-master').TaskSpec;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');
let userModel = require('../models');

let syncTaskSpec = function (username, callback) {
    let userDbConnection = userModel("wi_" + username, function (err) {
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
            content: row[2],
            description: row[3],
            type: row[4]
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
module.exports = {
    createTaskSpec: createTaskSpec,
    syncTaskSpec: syncTaskSpec
};