const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const overlayLineMaster = require('../models-master').OverlayLine;
const asyncLoop = require('async/each');
const userModels = require('../models');
const asyncSeries = require('async/series');
const path = require('path');
let config = require('config');

function syncOverlayLine(username, callback) {
    let userDbConnection = userModels(config.Database.prefix + username, function (err) {
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
                console.log(err);
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
    let idCurveX = payload.idCurveX;
    let idCurveY = payload.idCurveY;
    OverlayLine.findByPk(payload.idOverlayLine).then(rs => {
        asyncSeries([
            function (cb) {
                if (idCurveX) {
                    dbConnection.Curve.findByPk(idCurveX).then(curve => {
                        if (curve.idFamily) {
                            dbConnection.Family.findByPk(curve.idFamily).then(family => {
                                cb(null, family.name);
                            });
                        } else {
                            cb(null, null);
                        }
                    }).catch(err => {
                        console.log(err);
                        cb(err, null);
                    });
                } else {
                    cb(null, null);
                }
            },
            function (cb) {
                if (idCurveY) {
                    dbConnection.Curve.findByPk(idCurveY).then(curve => {
                        console.log(curve.idFamily);
                        if (curve.idFamily) {
                            dbConnection.Family.findByPk(curve.idFamily).then(family => {
                                cb(null, family.name);
                            });
                        } else {
                            cb(null, null);
                        }
                    }).catch(err => {
                        console.log(err);
                        cb(null, null);
                    });
                } else {
                    cb(null, null);
                }
            }
        ], function (err, result) {
            console.log(result);
            let familyX = result[0];
            console.log(familyX);
            let familyY = result[1];
            console.log(familyY);
            if (rs) {
                let response = rs.toJSON();
                let isSwap = false;
                let arrGroupX = eval(rs.family_group_x);
                let arrGroupY = eval(rs.family_group_y);
                if (arrGroupX.indexOf(familyY) != -1 && arrGroupY.indexOf(familyX) != -1) {
                    isSwap = true;
                }
                console.log(isSwap);
                let file = path.join(__dirname, 'data', rs.overlay_line_specs);
                try {
                    response.data = require(file);
                    response.data.isSwap = isSwap;
                    console.log(isSwap);
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
                } catch (err) {
                    response.data = {};
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "No file found for this overlay line", response));
                }
            } else {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Overlay Line found"));
            }
        });
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
    Curve.findByPk(payload.idCurveX).then(curveX => {
        Curve.findByPk(payload.idCurveY).then(curveY => {
            asyncSeries([
                function (cb) {
                    if (curveX && curveX.idFamily) {
                        Family.findByPk(curveX.idFamily).then(family => {
                            cb(null, family.name);
                        });
                    } else {
                        cb("NO", null);
                    }
                },
                function (cb) {
                    if (curveY && curveY.idFamily) {
                        Family.findByPk(curveY.idFamily).then(family => {
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
                OverlayLine.findAll({raw: true}).then(overlayLines => {
                    asyncLoop(overlayLines, function (overlayLine, next) {
                        overlayLine.isSwap = false;
                        if (overlayLine.family_group_x == "" || overlayLine.family_group_y == "") {
                            next();
                        } else {
                            let arrGroupX = eval(overlayLine.family_group_x);
                            let arrGroupY = eval(overlayLine.family_group_y);
                            if (arrGroupY.length == 0) {
                                if (arrGroupX.indexOf(familyX) != -1) {
                                    response.push(overlayLine);
                                    next();
                                } else if (arrGroupX.indexOf(familyY) != -1) {
                                    overlayLine.isSwap = true;
                                    response.push(overlayLine);
                                    next();
                                } else {
                                    next();
                                }
                            } else {
                                if (arrGroupX.indexOf(familyX) != -1 && arrGroupY.indexOf(familyY) != -1) {
                                    response.push(overlayLine);
                                    next();
                                } else if (arrGroupX.indexOf(familyY) != -1 && arrGroupY.indexOf(familyX) != -1) {
                                    overlayLine.isSwap = true;
                                    response.push(overlayLine);
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
