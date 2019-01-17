"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;


function createNewUserDefineLine(line, done, dbConnection) {
    line.lineStyle = JSON.stringify(line.lineStyle);
    let lineModel = dbConnection.UserDefineLine;
    lineModel.create(line).then(line => {
        lineModel.findByPk(line.idUserDefineLine).then(rs => {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new user define line Successful", rs));
        });
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Create new user define line failed", err.message));
    });
}

function infoUserDefineLine(line, done, dbConnection) {
    let lineModel = dbConnection.UserDefineLine;
    lineModel.findByPk(line.idUserDefineLine).then(rs => {
        if (!rs) {
            rs.lineStyle = JSON.parse(rs.lineStyle);
            done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "No line found by id", line));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Get info user define line failed", line));
    });
}

function deleteUserDefineLine(line, done, dbConnection) {
    let lineModel = dbConnection.UserDefineLine;
    lineModel.findByPk(line.idUserDefineLine).then(l => {
        l.setDataValue('updatedBy', line.updatedBy);
        if (!l) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No line found", line));
        } else {
            l.destroy().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Delete Successful", l));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Something wrong", err.message));
            });
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Delete failed", err.message));
    });
}

function editUserDefineLine(line, done, dbConnection) {
    delete line.createdBy;
    let lineModel = dbConnection.UserDefineLine;
    line.lineStyle = JSON.stringify(line.lineStyle);
    lineModel.findByPk(line.idUserDefineLine).then(oldLine => {
        if (oldLine) {
            Object.assign(oldLine, line).save().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Successful", rs));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Can't edit", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No line", line));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit", err.message));
    });
}

module.exports = {
    createNewUserDefineLine: createNewUserDefineLine,
    editUserDefineLine: editUserDefineLine,
    deleteUserDefineLine: deleteUserDefineLine,
    infoUserDefineLine: infoUserDefineLine
}