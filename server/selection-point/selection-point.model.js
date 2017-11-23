var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var fs = require('fs-extra');
var asyncLoop = require('async/each');
var path = require('path');
var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;
var config = require('config');

function createSelectionPoint(payload, done, dbConnection) {
    let Model = dbConnection.SelectionPoint;
    let selectionObject = new Object();
    selectionObject.idCurve = payload.body.idCurve;
    let PointsPath = null;
    selectionObject.Points = Date.now() + '_Points';
    Model.create(selectionObject).then(rs => {
        PointsPath = hashDir.createPath(config.curveBasePath, payload.decoded.username + selectionObject.Points, selectionObject.Points + '.txt');
        fs.copy(payload.PointsPath, PointsPath, function (err) {
            if (err) {
                console.log("Err copy points file ", err);
            }
            console.log("Copy Points file success! ", PointsPath);
            fs.unlink(payload.PointsPath);
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", rs));
        });
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    })
    // console.log(selectionObject);
}

function editSelectionPoint(payload, done, dbConnection) {
    let Model = dbConnection.SelectionPoint;
    let PointsPath = null;
    Model.findById(payload.body.idSelectionPoint).then(row => {
        if (row) {
            let newRow = row.toJSON();
            newRow.idCurve = payload.body.idCurve || newRow.idCurve;
            Object.assign(row, newRow).save().then(row => {
                hashDir.deleteFolder(config.curveBasePath, payload.decoded.username + row.Points);
                PointsPath = hashDir.createPath(config.curveBasePath, payload.decoded.username + row.Points, row.Points + '.txt');
                fs.copy(payload.PointsPath, PointsPath, function (err) {
                    if (err) {
                        console.log("Err copy points file ", err);
                    }
                    console.log("Copy Points file success! ", PointsPath);
                    fs.unlink(payload.PointsPath);
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", row));
                });
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function infoSelectionPoint(payload, done, dbConnection) {
    let Model = dbConnection.SelectionPoint;
    Model.findById(payload.idSelectionPoint).then(rs => {
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

function deleteSelectionPoint(payload, done, dbConnection) {
    let Model = dbConnection.SelectionPoint;
    Model.findById(payload.body.idSelectionPoint).then(rs => {
        if (rs) {
            rs.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No selection point found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "err", err.message));
    })
}

function getDataSelectionPoint(payload, callback, dbConnection) {
    let Model = dbConnection.SelectionPoint;
    Model.findById(payload.body.idSelectionPoint).then(row => {
        if (row) {
            let resultStreaming = hashDir.createJSONReadStream(config.curveBasePath, payload.decoded.username + row.Points, row.Points + ".txt", '{\n"code": 200,\n"content" : ', '\n}');
            callback(resultStreaming);
        } else {
            callback("NO_ROW");
        }
    }).catch(err => {
        console.log(err);
        callback("ERR");
    })
}


module.exports = {
    createSelectionPoint: createSelectionPoint,
    infoSelectionPoint: infoSelectionPoint,
    deleteSelectionPoint: deleteSelectionPoint,
    editSelectionPoint: editSelectionPoint,
    getDataSelectionPoint: getDataSelectionPoint
}