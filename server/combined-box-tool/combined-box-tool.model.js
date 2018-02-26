"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewComboBoxSelect(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBoxTool;
    Model.create(payload).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function infoComboBoxSelect(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBoxTool;
    Model.findById(payload.idCombinedBoxTool, {include: {all: true}}).then(rs => {
        if (rs) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No row found by id"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });

}

function deleteNewComboBoxSelect(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBoxTool;
    Model.findById(payload.idCombinedBoxTool).then(rs => {
        if (rs) {
            rs.destroy().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No row found for delete"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}


function editNewComboBoxSelect(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBoxTool;
    Model.findById(payload.idCombinedBoxTool).then(rs => {
        if (rs) {
            let newCb = rs.toJSON();
            newCb.name = payload.name || newCb.name;
            newCb.color = payload.color || newCb.color;
            Object.assign(rs, newCb);
            rs.save().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", newCb));
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No row found for edit"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}


function listNewComboBoxSelect(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBoxTool;
    Model.findAll({
        where: {
            idCombinedBox: payload.idCombinedBox
        }
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

module.exports = {
    createNewComboBoxSelect: createNewComboBoxSelect,
    infoComboBoxSelect: infoComboBoxSelect,
    deleteNewComboBoxSelect: deleteNewComboBoxSelect,
    editNewComboBoxSelect: editNewComboBoxSelect,
    listNewComboBoxSelect: listNewComboBoxSelect
}