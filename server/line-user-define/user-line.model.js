"use strict";
var models = require('../models');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var lineModel = models.UserDefineLine;

function createNewUserDefineLine(line, done) {
    lineModel.create(line).then(line => {
        lineModel.findById(line.idUserDefineLine).then(rs => {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new user define line successfull", rs));
        });
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Create new user define line failed", err.message));
    });
}

function infoUserDefineLine(line, done) {
    lineModel.findById(line.idUserDefineLine).then(rs => {
        if (!rs) {
            done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "No line found by id", line));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Get info user define line failed", line));
    });
}

function deleteUserDefineLine(line, done) {
    lineModel.findById(line.idUserDefineLine).then(l => {
        if (!l) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No line found", line));
        } else {
            l.destroy().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successfull", l));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Something wrong", err.message));
            });
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Delete failed", err.message));
    });
}

function editUserDefineLine(line, done) {
    lineModel.findById(line.idUserDefineLine).then(oldLine => {
        if (oldLine) {
            Object.assign(oldLine, line).save().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Edit successfull", rs));
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