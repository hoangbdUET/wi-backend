var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var overlayLineMaster = require('../models-master').OverlayLine;
var asyncLoop = require('async/each');
var userModels = require('../models');
var asyncSeries = require('async/series');

function syncOverlayLine(username, callback) {
    let userDbConnection = userModels("wi_" + username, function (err) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
    });
    overlayLineMaster.findAll().then(rss => {
        asyncLoop(rss, function (line, next) {
            line = line.toJSON();
            delete line.createdAt;
            delete line.updatedAt;
            userDbConnection.OverlayLine.create(line).then(rs => {
                next();
            }).catch(err => {
                next(err);
            });
        }, function (err) {
            if (err) callback(err, null);
            callback(null, "DONE");
        });
    }).catch(err => {
        console.log(err);
    });
}

function createOverlayLine() {

}

function getOverlayLine(payload, callback, dbConnection) {
    let OverlayLine = dbConnection.OverlayLine;
    OverlayLine.findById(payload.idOverlayLine).then(rs => {
        if (rs) {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Overlay Line found"));
        }
    });
}

function editOverlayLine() {

}

function deleteOverlayLine() {

}


function getListOverlayLineByCurves(payload, callback, dbConnection) {
    let OverlayLine = dbConnection.OverlayLine;
    let Curve = dbConnection.Curve;
    let idCurveX = payload.idCurveX || 0;
    let idCurveY = payload.idCurveY || 0;
    let Family = dbConnection.Family;
    Curve.findById(payload.idCurveX).then(curveX => {
        Curve.findById(payload.idCurveY).then(curveY => {
            asyncSeries([
                function (cb) {
                    if (curveX && curveX.idFamily) {
                        Family.findById(curveX.idFamily).then(f => {
                            // console.log(f.name);
                            cb(null, f.familyGroup);
                        }).catch(err => {
                            cb(err, null);
                        });
                    } else {
                        cb(null, null);
                    }
                },
                function (cb) {
                    if (curveY && curveY.idFamily) {
                        Family.findById(curveY.idFamily).then(f => {
                            // console.log(f.name);
                            cb(null, f.familyGroup);
                        }).catch(err => {
                            cb(err, null);
                        });
                    } else {
                        cb(null, null);
                    }
                }
            ], function (err, families) {
                let _family_group_x = families[0];
                let _family_group_y = families[1];
                let Sequelize = require('sequelize');
                OverlayLine.findAll({
                    where: Sequelize.and(
                        {family_group_x: _family_group_x},
                        {family_group_y: _family_group_y}
                    )
                }).then(rs => {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
                });
            });
        });
    });
}

function getAllOverlayLine(payload, callback, dbConnection) {
    let OverlayLine = dbConnection.OverlayLine;
    OverlayLine.findAll().then(lines => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", lines));
    }).catch(err => {
        console.log(err);
    })
}

module.exports = {
    createOverlayLine: createOverlayLine,
    getOverlayLine: getOverlayLine,
    editOverlayLine: editOverlayLine,
    deleteOverlayLine: deleteOverlayLine,
    getListOverlayLineByCurves: getListOverlayLineByCurves,
    syncOverlayLine: syncOverlayLine,
    getAllOverlayLine: getAllOverlayLine
}
