let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createSelectionTool(payload, done, dbConnection) {
    let Model = dbConnection.SelectionTool;
    Model.create(payload).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function editSelectionTool(payload, done, dbConnection) {
    let Model = dbConnection.SelectionTool;
    Model.findById(payload.idSelectionTool).then(row => {
        if (row) {
            Object.assign(row, payload).save().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", row));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function infoSelectionTool(payload, done, dbConnection) {
    let Model = dbConnection.SelectionTool;
    Model.findById(payload.idSelectionTool).then(rs => {
        if (rs) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found by id"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
    });
}

function deleteSelectionTool(payload, done, dbConnection) {
    let Model = dbConnection.SelectionTool;
    Model.findById(payload.idSelectionTool).then(rs => {
        if (rs) {
            rs.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "err", err.message));
    });
}

module.exports = {
    createSelectionTool: createSelectionTool,
    infoSelectionTool: infoSelectionTool,
    deleteSelectionTool: deleteSelectionTool,
    editSelectionTool: editSelectionTool
};