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
                // where: {isDefault: true}
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
            symbolStrokeStyle: curve.LineProperty.family_spec[0].lineColor,
            createdBy: lineInfo.createdBy,
            updatedBy: lineInfo.updatedBy
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
    let convertUnit = require('../family-unit/family-unit.model');
    if (!lineInfo.idCurve) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need idCurve"));
    dbConnection.Curve.findById(lineInfo.idCurve).then(curve => {
        if (!curve) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found in line info", lineInfo));
        } else {
            curveModel.calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
                let curveMinScale = result.minScale;
                let curveMaxScale = result.maxScale;
                curve.getLineProperty({
                    include: {
                        model: dbConnection.FamilySpec,
                        as: 'family_spec',
                        // where: {isDefault: true}
                    }
                }).then(family => {
                    if (family) {
                        convertUnit.getListUnitByIdFamily(family.idFamily, dbConnection).then(units => {
                            let unitConvertData = {};
                            let _line = {};
                            unitConvertData.srcUnit = units.find(u => u.name === curve.unit);
                            unitConvertData.desUnit = units.find(u => u.name === family.family_spec[0].unit);
                            if (!unitConvertData.srcUnit || !unitConvertData.desUnit) {
                                _line.minValue = family.family_spec[0].minScale;
                                _line.maxValue = family.family_spec[0].maxScale;
                            } else {
                                let s1 = JSON.parse(unitConvertData.desUnit.rate);
                                let s2 = JSON.parse(unitConvertData.srcUnit.rate);
                                _line.minValue = (parseFloat(family.family_spec[0].minScale) - s1[1]) * (s2[0] / s1[0]) + s2[1];
                                _line.maxValue = (parseFloat(family.family_spec[0].maxScale) - s1[1]) * (s2[0] / s1[0]) + s2[1];
                            }
                            console.log(family.family_spec[0].minScale);
                            console.log(family.family_spec[0].maxScale);
                            let _ = require('lodash');
                            if (!isFinite(_line.minValue)|| !isFinite(!_line.maxValue) || !family.family_spec[0]) {
                                console.log("CHANGE VALUE");
                                _line.minValue = curveMinScale;
                                _line.maxValue = curveMaxScale;
                            }
                            _line.idTrack = lineInfo.idTrack;
                            _line.idCurve = curve.idCurve;
                            _line.alias = curve.name;
                            _line.unit = curve.unit;
                            _line.displayMode = family.family_spec[0].displayMode;
                            _line.blockPosition = family.family_spec[0].blockPosition;
                            _line.displayType = family.family_spec[0].displayType;
                            _line.lineStyle = family.family_spec[0].lineStyle;
                            _line.lineWidth = family.family_spec[0].lineWidth;
                            _line.lineColor = family.family_spec[0].lineColor;
                            _line.symbolFillStyle = family.family_spec[0].lineColor;
                            _line.symbolStrokeStyle = family.family_spec[0].lineColor;
                            _line.orderNum = lineInfo.orderNum;
                            _line.createdBy = lineInfo.createdBy;
                            _line.updatedBy = lineInfo.updatedBy;
                            dbConnection.Line.create(_line).then(l => {
                                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", l));
                            }).catch(err => {
                                console.log(err);
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                            })
                        });
                    } else {
                        dbConnection.Line.create({
                            idTrack: lineInfo.idTrack,
                            idCurve: curve.idCurve,
                            alias: curve.name,
                            minValue: curveMinScale,
                            maxValue: curveMaxScale,
                            orderNum: lineInfo.orderNum,
                            createdBy: lineInfo.createdBy,
                            updatedBy: lineInfo.updatedBy,
                            unit: curve.unit || 'N/A'
                        }).then(l => {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", l.toJSON()));
                        }).catch(function (err) {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + err.message));
                        });
                    }
                });
            });
        }
    });
}

function _createNewLine(lineInfo, done, dbConnection, username) {
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
                                // console.log("====idF ", family.idFamily);
                                dbConnection.Family.findById(family.idFamily, {
                                    include: {
                                        model: dbConnection.FamilySpec,
                                        as: 'family_spec',
                                        // where: {isDefault: true}
                                    }
                                }).then(familyInfo => {
                                    // console.log("+++", familyInfo);
                                    curveModel.calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
                                        let minScale = familyInfo.family_spec[0].minScale;
                                        let maxScale = familyInfo.family_spec[0].maxScale;
                                        if (!minScale || !maxScale) {
                                            minScale = result.minScale;
                                            maxScale = result.maxScale;
                                        } else {

                                        }
                                        Line.build({
                                            idTrack: lineInfo.idTrack,
                                            idCurve: curve.idCurve,
                                            alias: curve.name,
                                            unit: curve.unit,
                                            minValue: minScale,
                                            maxValue: maxScale,
                                            displayMode: familyInfo.family_spec[0].displayMode,
                                            blockPosition: familyInfo.family_spec[0].blockPosition,
                                            displayType: familyInfo.family_spec[0].displayType,
                                            lineStyle: familyInfo.family_spec[0].lineStyle,
                                            lineWidth: familyInfo.family_spec[0].lineWidth,
                                            lineColor: familyInfo.family_spec[0].lineColor,
                                            symbolFillStyle: familyInfo.family_spec[0].lineColor,
                                            symbolStrokeStyle: familyInfo.family_spec[0].lineColor,
                                            orderNum: lineInfo.orderNum,
                                            createdBy: lineInfo.createdBy,
                                            updatedBy: lineInfo.updatedBy
                                        }).save()
                                            .then(function (line) {
                                                done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line));
                                            })
                                            .catch(function (err) {
                                                console.log(err);
                                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
                                            });
                                    });
                                }).catch(err => {
                                    console.log(err);
                                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + " idTrack not exist", err));
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
                                        orderNum: lineInfo.orderNum,
                                        createdBy: lineInfo.createdBy,
                                        updatedBy: lineInfo.updatedBy
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
    delete lineInfo.createdBy;
    delete lineInfo.createdBy;
    delete lineInfo.changed;
    if (lineInfo.lineStyle) lineInfo.lineStyle = typeof(lineInfo.lineStyle) === 'object' ? JSON.stringify(lineInfo.lineStyle) : lineInfo.lineStyle;
    if (lineInfo.symbolLineDash) lineInfo.symbolLineDash = typeof(lineInfo.symbolLineDash) === 'object' ? JSON.stringify(lineInfo.symbolLineDash) : lineInfo.symbolLineDash;
    let Line = dbConnection.Line;
    Line.findById(lineInfo.idLine, {include: {all: true}}).then(line => {
        if (line) {
            if (line.idTrack != lineInfo.idTrack && lineInfo.idTrack) {
                console.log("Vao day");
                dbConnection.Shading.findAll({
                    where: {idTrack: line.idTrack},
                    include: {all: true}
                }).then(shadings => {
                    asyncLoop(shadings, function (shading, next) {
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
                console.log("Update line");
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
            line.setDataValue('updatedBy', lineInfo.updatedBy);
            let Sequelize = require('sequelize');
            dbConnection.Shading.findAll({
                where: Sequelize.or(
                    {idLeftLine: line.idLine},
                    {idRightLine: line.idLine}
                )
            }).then(shadings => {
                line.destroy({force: true})
                    .then(function () {
                        line = line.toJSON();
                        line.shadings = shadings;
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Line is deleted", line));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
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
