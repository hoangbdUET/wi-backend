// var models = require('../models');
// var Line = models.Line;
var ErrorCodes = require('../../error-codes').CODES;
// var Curve = models.Curve;
const ResponseJSON = require('../response');
var curveModel = require('../curve/curve.model');
const asyncLoop = require('async/each');
const asyncSeries = require('async/series');

function getWellIdByTrack(idTrack, dbConnection, callback) {
    let Track = dbConnection.Track;
    let Plot = dbConnection.Plot;
    Track.findById(idTrack).then(track => {
        Plot.findById(track.idPlot).then(plot => {
            callback(null, plot.idWell);
        }).catch(err => {
            callback(err, null);
        });
    }).catch(err => {
        callback(err, null);
    });
}

//TODO: GIU CAI NAY LAI DE SAU NAY DUNG :D
// function createNewLine_(lineInfo, done, dbConnection) {
//     var Line = dbConnection.Line;
//     var Curve = dbConnection.Curve;
//     var Dataset = dbConnection.Dataset;
//     Line.sync()
//         .then(
//             function () {
//                 Curve.findById(lineInfo.idCurve)
//                     .then(function (curve) {
//                         Dataset.findById(curve.idDataset).then(dataset => {
//                             getWellIdByTrack(lineInfo.idTrack, dbConnection, function (err, idWell) {
//                                 if (idWell == dataset.idWell) {
//                                     curve.getLineProperty()
//                                         .then(function (family) {
//                                             Line.build({
//                                                 idTrack: lineInfo.idTrack,
//                                                 idCurve: curve.idCurve,
//                                                 alias: curve.name,
//                                                 minValue: family.minScale,
//                                                 maxValue: family.maxScale,
//                                                 displayMode: family.displayMode,
//                                                 blockPosition: family.blockPosition,
//                                                 displayType: family.displayType,
//                                                 lineStyle: family.lineStyle,
//                                                 lineWidth: family.lineWidth,
//                                                 lineColor: family.lineColor
//                                             }).save()
//                                                 .then(function (line) {
//                                                     done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line));
//                                                 })
//                                                 .catch(function (err) {
//                                                     done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + " idTrack not exist"));
//                                                 });
//                                         })
//                                         .catch(function (err) {
//                                             //console.log(err);
//                                             //console.log("No family " + lineInfo.idTrack);
//                                             //fix create new line error without family
//                                             Line.build({
//                                                 idTrack: lineInfo.idTrack,
//                                                 idCurve: curve.idCurve,
//                                                 alias: curve.name
//                                             }).save()
//                                                 .then(function (line) {
//                                                     done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line.toJSON()));
//                                                 })
//                                                 .catch(function (err) {
//                                                     done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + err.message));
//                                                 });
//                                         });
//                                 } else {
//                                     done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Can't create line out of its WELL", "HAHA"));
//                                 }
//                             });
//                         });
//                     })
//                     .catch(function () {
//                         done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for Create New Line"));
//                     })
//             },
//             function () {
//                 done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
//             }
//         )
//
// }
function createNewLineWithoutResponse(lineInfo, dbConnection, username, callback) {
    var Line = dbConnection.Line;
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    Line.sync()
        .then(
            function () {
                Curve.findById(lineInfo.idCurve)
                    .then(function (curve) {
                        curve.getLineProperty()
                            .then(function (family) {
                                Line.build({
                                    idTrack: lineInfo.idTrack,
                                    idCurve: curve.idCurve,
                                    alias: curve.name,
                                    unit: curve.unit,
                                    minValue: family.minScale,
                                    maxValue: family.maxScale,
                                    displayMode: family.displayMode,
                                    blockPosition: family.blockPosition,
                                    displayType: family.displayType,
                                    lineStyle: family.lineStyle,
                                    lineWidth: family.lineWidth,
                                    lineColor: family.lineColor
                                }).save()
                                    .then(function (line) {
                                        callback(line);
                                    })
                                    .catch(function (err) {
                                        callback(null);
                                    });
                            })
                            .catch(function (err) {
                                //console.log(err);
                                //console.log("No family " + lineInfo.idTrack);
                                //fix create new line error without family
                                curveModel.calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
                                    Line.build({
                                        idTrack: lineInfo.idTrack,
                                        idCurve: curve.idCurve,
                                        alias: curve.name,
                                        minValue: result.minScale,
                                        maxValue: result.maxScale
                                    }).save()
                                        .then(function (line) {
                                            callback(line);
                                        })
                                        .catch(function (err) {
                                            callback(null);
                                        });
                                });
                            });
                    })
                    .catch(function () {
                        callback(null);
                    })
            },
            function () {
                callback(null);
            }
        )

}

function createNewLine(lineInfo, done, dbConnection, username) {
    delete lineInfo.changed;
    var Line = dbConnection.Line;
    var Curve = dbConnection.Curve;
    var Dataset = dbConnection.Dataset;
    Line.sync()
        .then(
            function () {
                Curve.findById(lineInfo.idCurve)
                    .then(function (curve) {
                        curve.getLineProperty()
                            .then(function (family) {
                                Line.build({
                                    idTrack: lineInfo.idTrack,
                                    idCurve: curve.idCurve,
                                    alias: curve.name,
                                    unit: curve.unit,
                                    minValue: family.minScale,
                                    maxValue: family.maxScale,
                                    displayMode: family.displayMode,
                                    blockPosition: family.blockPosition,
                                    displayType: family.displayType,
                                    lineStyle: family.lineStyle,
                                    lineWidth: family.lineWidth,
                                    lineColor: family.lineColor
                                }).save()
                                    .then(function (line) {
                                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line));
                                    })
                                    .catch(function (err) {
                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + " idTrack not exist"));
                                    });
                            })
                            .catch(function (err) {
                                //console.log(err);
                                //console.log("No family " + lineInfo.idTrack);
                                //fix create new line error without family
                                curveModel.calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
                                    Line.build({
                                        idTrack: lineInfo.idTrack,
                                        idCurve: curve.idCurve,
                                        alias: curve.name,
                                        minValue: result.minScale,
                                        maxValue: result.maxScale
                                    }).save()
                                        .then(function (line) {
                                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line.toJSON()));
                                        })
                                        .catch(function (err) {
                                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + err.message));
                                        });
                                });
                            });
                    })
                    .catch(function () {
                        done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for Create New Line"));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}

function editLine(lineInfo, done, dbConnection) {
    delete lineInfo.changed;
    let Line = dbConnection.Line;
    Line.findById(lineInfo.idLine, {include: {all: true}}).then(line => {
        if (line) {
            if (line.idTrack != lineInfo.idTrack) {
                dbConnection.Shading.findAll({
                    where: {idTrack: line.idTrack},
                    include: {all: true}
                }).then(shadings => {
                    asyncLoop(shadings, function (shading, next) {
                        console.log(shading.toJSON());
                        if (shading.idLeftLine && shading.idRightLine) {
                            shading.destroy().then(() => {
                                next();
                            }).catch(err => {
                                next();
                            });
                        } else {
                            asyncSeries([
                                function (cb) {
                                    if (shading.leftLine) {
                                        if (shading.leftLine.idLine === line.idLine) {
                                            shading.idLeftLine = line.idLine;
                                            shading.idTrack = lineInfo.idTrack;
                                            cb();
                                        } else {
                                            cb();
                                        }
                                    } else {
                                        cb();
                                    }
                                },
                                function (cb) {
                                    if (shading.rightLine) {
                                        if (shading.rightLine.idLine === line.idLine) {
                                            shading.idRightLine = line.idLine;
                                            shading.idTrack = lineInfo.idTrack;
                                            cb();
                                        } else {
                                            cb();
                                        }
                                    } else {
                                        cb();
                                    }
                                }
                            ], function () {
                                shading.save().then(s => {
                                    console.log("Edit shading");
                                    next();
                                }).catch(err => {
                                    console.log(err);
                                    next();
                                });
                            });
                        }

                    }, function () {
                        Object.assign(line, lineInfo).save().then(rs => {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Done", line));
                        }).catch(err => {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
                        });
                    });
                });
            } else {
                Object.assign(line, lineInfo).save().then(rs => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
                }).catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
                });
            }
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Line Found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
    });
}

function deleteLine(lineInfo, done, dbConnection) {
    var Line = dbConnection.Line;
    Line.findById(lineInfo.idLine)
        .then(function (line) {
            line.destroy({
                force: true
            })
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Line is deleted", line));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Line" + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for delete"));
        })
}

function getLineInfo(line, done, dbConnection) {
    var Line = dbConnection.Line;
    Line.findById(line.idLine, {include: [{all: true, include: [{all: true}]}]})
        .then(function (line) {
            if (!line) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Line success", line));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for get info"));
        })
}

module.exports = {
    createNewLine: createNewLine,
    editLine: editLine,
    deleteLine: deleteLine,
    getLineInfo: getLineInfo,
    createNewLineWithoutResponse: createNewLineWithoutResponse
};
