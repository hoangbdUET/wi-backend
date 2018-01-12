// let models = require('../models');
// let Line = models.Line;
let ErrorCodes = require('../../error-codes').CODES;
// let Curve = models.Curve;
const ResponseJSON = require('../response');
let curveModel = require('../curve/curve.model');
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
//     let Line = dbConnection.Line;
//     let Curve = dbConnection.Curve;
//     let Dataset = dbConnection.Dataset;
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
    let Line = dbConnection.Line;
    let Curve = dbConnection.Curve;
    Curve.findById(lineInfo.idCurve, {
        include: {
            model: dbConnection.Family,
            as: 'LineProperty',
            include: {
                model: dbConnection.FamilySpec,
                as: 'family_spec',
                where: {isDefault: true}
            }
        }
    }).then(curve => {
        Line.build({
            idTrack: lineInfo.idTrack,
            idCurve: curve.idCurve,
            alias: curve.name,
            unit: curve.LineProperty.family_spec[0].unit,
            minValue: curve.LineProperty.family_spec[0].minScale,
            maxValue: curve.LineProperty.family_spec[0].maxScale,
            displayMode: curve.LineProperty.family_spec[0].displayMode,
            blockPosition: curve.LineProperty.family_spec[0].blockPosition,
            displayType: curve.LineProperty.family_spec[0].displayType,
            lineStyle: curve.LineProperty.family_spec[0].lineStyle,
            lineWidth: curve.LineProperty.family_spec[0].lineWidth,
            lineColor: curve.LineProperty.family_spec[0].lineColor,
            symbolFillStyle: curve.LineProperty.family_spec[0].lineColor,
            symbolStrokeStyle: curve.LineProperty.family_spec[0].lineColor
        }).save()
            .then(function (line) {
                callback(line);
            })
            .catch(function (err) {
                callback(null);
            });
    });
}

function createNewLine(lineInfo, done, dbConnection, username) {
    delete lineInfo.changed;
    let Line = dbConnection.Line;
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    Line.sync()
        .then(
            function () {
                Curve.findById(lineInfo.idCurve)
                    .then(function (curve) {
                        curve.getLineProperty()
                            .then(function (family) {
                                dbConnection.Family.findById(family.idFamily, {
                                    include: {
                                        model: dbConnection.FamilySpec,
                                        as: 'family_spec',
                                        where: {isDefault: true}
                                    }
                                }).then(familyInfo => {
                                    Line.build({
                                        idTrack: lineInfo.idTrack,
                                        idCurve: curve.idCurve,
                                        alias: curve.name,
                                        unit: curve.unit,
                                        minValue: familyInfo.family_spec[0].minScale,
                                        maxValue: familyInfo.family_spec[0].maxScale,
                                        displayMode: familyInfo.family_spec[0].displayMode,
                                        blockPosition: familyInfo.family_spec[0].blockPosition,
                                        displayType: familyInfo.family_spec[0].displayType,
                                        lineStyle: familyInfo.family_spec[0].lineStyle,
                                        lineWidth: familyInfo.family_spec[0].lineWidth,
                                        lineColor: familyInfo.family_spec[0].lineColor,
                                        symbolFillStyle: familyInfo.family_spec[0].lineColor,
                                        symbolStrokeStyle: familyInfo.family_spec[0].lineColor,
                                        orderNum: lineInfo.orderNum
                                    }).save()
                                        .then(function (line) {
                                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line));
                                        })
                                        .catch(function (err) {
                                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + " idTrack not exist"));
                                        });
                                }).catch(err => {
                                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + " idTrack not exist"));
                                });
                            })
                            .catch(function (err) {
                                curveModel.calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
                                    Line.build({
                                        idTrack: lineInfo.idTrack,
                                        idCurve: curve.idCurve,
                                        alias: curve.name,
                                        minValue: result.minScale,
                                        maxValue: result.maxScale,
                                        orderNum: lineInfo.orderNum
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
    if (lineInfo.lineStyle) lineInfo.lineStyle = typeof(lineInfo.lineStyle) === 'object' ? JSON.stringify(lineInfo.lineStyle) : lineInfo.lineStyle;
    if (lineInfo.symbolLineDash) lineInfo.symbolLineDash = typeof(lineInfo.symbolLineDash) === 'object' ? JSON.stringify(lineInfo.symbolLineDash) : lineInfo.symbolLineDash;
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
    let Line = dbConnection.Line;
    Line.findById(lineInfo.idLine)
        .then(function (line) {
            let Sequelize = require('sequelize');
            dbConnection.Shading.findAll({
                where: Sequelize.or(
                    {idLeftLine: line.idLine},
                    {idRightLine: line.idLine}
                )
            }).then(shadings => {
                line.destroy()
                    .then(function () {
                        line = line.toJSON();
                        line.shadings = shadings;
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Line is deleted", line));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Line" + err.errors[0].message));
                    });
            }).catch(err => {

            });
        })
        .catch(function (err) {
            console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for delete", err));
        })
}

function getLineInfo(line, done, dbConnection) {
    let Line = dbConnection.Line;
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
