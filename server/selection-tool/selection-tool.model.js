let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let hashDir = require('../utils/data-tool').hashDir;
let config = require('config');
let fs = require('fs-extra');

function createSelectionTool(payload, done, dbConnection, username) {
    payload.data = "{}";
    dbConnection.SelectionTool.create(payload).then(rs => {
		let binPath = hashDir.createPath(config.curveBasePath, username + rs.idSelectionTool, rs.idSelectionTool + '.txt');
		console.log(binPath);
        rs = rs.toJSON();
        fs.copy(payload.BIN, binPath, function (err) {
            if (err) {
                fs.unlinkSync(payload.BIN);
                console.log("Err copy points file ", err);
            }
            console.log("Copy points file success! ", binPath);
            fs.unlinkSync(payload.BIN);
            rs.data = JSON.parse(fs.readFileSync(binPath).toString());
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        });
    }).catch(err => {
        console.log(err);
        fs.unlinkSync(payload.BIN);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function editSelectionTool(payload, done, dbConnection, username) {
    payload.data = "{}";
    let Model = dbConnection.SelectionTool;
    Model.findByPk(payload.idSelectionTool).then(row => {
        if (row) {
            if (payload.BIN) {
				let binPath = hashDir.createPath(config.curveBasePath, username + row.idSelectionTool, row.idSelectionTool + '.txt');
				console.log("THong ", binPath, payload.BIN);
                fs.copy(payload.BIN, binPath, function (err) {
                    if (err) {
                        fs.unlinkSync(payload.BIN);
                        console.log("Err copy points file ", err);
                    }
                    console.log("Copy points file success! ", binPath);
                    fs.unlinkSync(payload.BIN);
                    delete payload.BIN;
                    Object.assign(row, payload).save().then(() => {
                        row.data = JSON.parse(fs.readFileSync(binPath).toString());
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", row));
                    }).catch(err => {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
                    });
                });
            } else {
				Object.assign(row, payload).save().then(() => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", row));
				}).catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
                });
            }
        } else {
            fs.unlinkSync(payload.BIN);
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found"));
        }
    }).catch(err => {
        fs.unlinkSync(payload.BIN);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function infoSelectionTool(payload, done, dbConnection, username) {
    let Model = dbConnection.SelectionTool;
    Model.findByPk(payload.idSelectionTool).then(rs => {
        if (rs) {
            rs = rs.toJSON();
			let binPath = hashDir.createPath(config.curveBasePath, username + rs.idSelectionTool, rs.idSelectionTool + '.txt');

			console.log("Get selection tool data path ", binPath);
            rs.data = JSON.parse(fs.readFileSync(binPath).toString());
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found by id"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
    });
}

function deleteSelectionTool(payload, done, dbConnection, username) {
    let Model = dbConnection.SelectionTool;
    Model.findByPk(payload.idSelectionTool).then(rs => {
        if (rs) {
            rs.destroy().then(() => {
                hashDir.deleteFolder(config.curveBasePath, username + rs.idSelectionTool);
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "err", err.message));
    });
}

function createSelectionToolForPlot(payload, done, dbConnection) {
    let Model = dbConnection.SelectionTool;
    Model.create(payload).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

module.exports = {
    createSelectionTool: createSelectionTool,
    infoSelectionTool: infoSelectionTool,
    deleteSelectionTool: deleteSelectionTool,
    editSelectionTool: editSelectionTool
};
