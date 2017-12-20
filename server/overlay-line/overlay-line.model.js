var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var overlayLineMaster = require('../models-master').OverlayLine;
var asyncLoop = require('async/each');
var userModels = require('../models');
var asyncSeries = require('async/series');
var path = require('path');

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
            let response = rs.toJSON();
            let file = path.join(__dirname, 'data', rs.overlay_line_specs);
            try {
                response.data = require(file);
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
            } catch (err) {
                response.data = {};
                callback(ResponseJSON(ErrorCodes.SUCCESS, "No file found for this overlay line", response));
            }
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
    let Family = dbConnection.Family;
    Curve.findById(payload.idCurveX).then(curveX => {
        Curve.findById(payload.idCurveY).then(curveY => {
            asyncSeries([
                function (cb) {
                    if (curveX && curveX.idFamily) {
                        Family.findById(curveX.idFamily).then(family => {
                            cb(null, family.name);
                        });
                    } else {
                        cb("NO", null);
                    }
                },
                function (cb) {
                    if (curveY && curveY.idFamily) {
                        Family.findById(curveY.idFamily).then(family => {
                            cb(null, family.name);
                        });
                    } else {
                        cb("NO", null);
                    }
                }
            ], function (err, families) {
                let familyX = families[0];
                let familyY = families[1];
                let response = [];
                OverlayLine.findAll().then(overlayLines => {
                    asyncLoop(overlayLines, function (overlayLine, next) {
                        if (overlayLine.family_group_x == "" || overlayLine.family_group_y == "") {
                            next();
                        } else {
                            // console.log("X : ", overlayLine.idOverlayLine, overlayLine.family_group_x);
                            // console.log("Y : ", overlayLine.idOverlayLine, overlayLine.family_group_y);
                            let arrGroupX = eval(overlayLine.family_group_x);
                            let arrGroupY = eval(overlayLine.family_group_y);
                            console.log("==========", arrGroupY.length);
                            if (arrGroupY.length == 0) {
                                if (arrGroupX.indexOf(familyX) != -1) {
                                    response.push(overlayLine);
                                    next();
                                } else {
                                    next();
                                }
                            } else {
                                if (arrGroupX.indexOf(familyX) != -1 && arrGroupY.indexOf(familyY) != -1) {
                                    response.push(overlayLine.toJSON());
                                    next();
                                } else {
                                    next();
                                }
                            }
                        }
                    }, function () {
                        callback(ResponseJSON(ErrorCodes.SUCCESS, "Done", response));
                    });
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
