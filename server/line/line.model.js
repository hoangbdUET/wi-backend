// var models = require('../models');
// var Line = models.Line;
var ErrorCodes = require('../../error-codes').CODES;
// var Curve = models.Curve;
const ResponseJSON = require('../response');
var curveModel = require('../curve/curve.model');

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
    var Line = dbConnection.Line;
    Line.findById(lineInfo.idLine)
        .then(function (line) {
            line.idTrack = lineInfo.idTrack;
            line.minValue = lineInfo.minValue;
            line.maxValue = lineInfo.maxValue;
            line.displayMode = lineInfo.displayMode;
            line.blockPosition = lineInfo.blockPosition;
            line.displayType = lineInfo.displayType;
            line.lineStyle = lineInfo.lineStyle;
            line.lineWidth = lineInfo.lineWidth;
            line.lineColor = lineInfo.lineColor;

            line.showHeader = lineInfo.showHeader;
            line.showDataset = lineInfo.showDataset;
            line.autoValueScale = lineInfo.autoValueScale;
            line.wrapMode = lineInfo.wrapMode;
            line.ignoreMissingValues = lineInfo.ignoreMissingValues;
            line.displayAs = lineInfo.displayAs;
            line.alias = lineInfo.alias;
            line.symbolName = lineInfo.symbolName;
            line.symbolSize = lineInfo.symbolSize;
            line.symbolStrokeStyle = lineInfo.symbolStrokeStyle;
            line.symbolFillStyle = lineInfo.symbolFillStyle;
            line.symbolLineWidth = lineInfo.symbolLineWidth;
            line.symbolLineDash = lineInfo.symbolLineDash;

            line.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Line success", lineInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Line " + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for edit"));
        })
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
