// let models = require('../models');
// let Line = models.Line;
let ErrorCodes = require('../../error-codes').CODES;
// let Curve = models.Curve;
const ResponseJSON = require('../response');
let curveModel = require('../curve/curve.model');
const asyncLoop = require('async/each');
const asyncSeries = require('async/series');
const _ = require('lodash');

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

function createNewLineWithoutResponse(lineInfo, dbConnection, username) {
    return new Promise(resolve => {
        let convertUnit = require('../family-unit/family-unit.model');
        if (!lineInfo.idCurve) return resolve();
        dbConnection.Curve.findById(lineInfo.idCurve).then(curve => {
            if (!curve) {
                resolve();
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
                                    _line.minValue = _.isFinite(lineInfo.minValue) ? lineInfo.minValue : family.family_spec[0].minScale;
                                    _line.maxValue = _.isFinite(lineInfo.maxValue) ? lineInfo.maxValue : family.family_spec[0].maxScale;
                                } else {
                                    let s1 = JSON.parse(unitConvertData.desUnit.rate);
                                    let s2 = JSON.parse(unitConvertData.srcUnit.rate);
                                    _line.minValue = _.isFinite(lineInfo.minValue) ? lineInfo.minValue : (parseFloat(family.family_spec[0].minScale) - s1[1]) * (s2[0] / s1[0]) + s2[1];
                                    _line.maxValue = _.isFinite(lineInfo.maxValue) ? lineInfo.maxValue : (parseFloat(family.family_spec[0].maxScale) - s1[1]) * (s2[0] / s1[0]) + s2[1];
                                }
                                if (!_.isFinite(_line.minValue) || !_.isFinite(_line.maxValue) || !family.family_spec[0]) {
                                    console.log("CHANGE VALUE");
                                    _line.minValue = curveMinScale;
                                    _line.maxValue = curveMaxScale;
                                }
                                _line.idTrack = lineInfo.idTrack;
                                _line.idCurve = curve.idCurve;
                                _line.alias = lineInfo.alias || curve.name;
                                _line.unit = lineInfo.unit || curve.unit;
                                _line.displayMode = lineInfo.displayMode || family.family_spec[0].displayMode;
                                _line.ignoreMissingValues = lineInfo.ignoreMissingValues;
                                _line.displayAs = lineInfo.displayAs;
                                _line.blockPosition = lineInfo.blockPosition || family.family_spec[0].blockPosition;
                                _line.displayType = lineInfo.displayType || family.family_spec[0].displayType;
                                _line.lineStyle = lineInfo.lineStyle || family.family_spec[0].lineStyle;
                                _line.lineWidth = lineInfo.lineWidth || family.family_spec[0].lineWidth;
                                _line.lineColor = lineInfo.lineColor || family.family_spec[0].lineColor;
                                _line.symbolFillStyle = lineInfo.symbolFillStyle || lineInfo.lineColor || family.family_spec[0].lineColor;
                                _line.symbolStrokeStyle = lineInfo.symbolStrokeStyle || lineInfo.lineColor || family.family_spec[0].lineColor;
                                _line.symbolSize = lineInfo.symbolSize;
                                _line.autoValueScale = lineInfo.autoValueScale;
                                _line.orderNum = lineInfo.orderNum;
                                _line.showDataset = lineInfo.showDataset;
                                _line.showHeader = lineInfo.showHeader;
                                _line.createdBy = lineInfo.createdBy;
                                _line.updatedBy = lineInfo.updatedBy;
                                _line.symbolLineDash = lineInfo.symbolLineDash;
                                _line.symbolLineWidth = lineInfo.symbolLineWidth;
                                _line.wrapMode = lineInfo.wrapMode;
                                _line.symbolName = lineInfo.symbolName;
                                dbConnection.Line.create(_line).then(l => {
                                    resolve();
                                }).catch(err => {
                                    console.log(err);
                                    resolve();
                                })
                            });
                        } else {
                            dbConnection.Line.create({
                                idTrack: lineInfo.idTrack,
                                idCurve: curve.idCurve,
                                alias: lineInfo.alias || curve.name,
                                minValue: _.isFinite(lineInfo.minValue) ? lineInfo.minValue : curveMinScale,
                                maxValue: _.isFinite(lineInfo.maxValue) ? lineInfo.maxValue : curveMaxScale,
                                ignoreMissingValues: lineInfo.ignoreMissingValues,
                                orderNum: lineInfo.orderNum,
                                createdBy: lineInfo.createdBy,
                                updatedBy: lineInfo.updatedBy,
                                unit: lineInfo.unit || curve.unit || 'N/A',
                                displayMode: lineInfo.displayMode,
                                blockPosition: lineInfo.blockPosition,
                                displayType: lineInfo.displayType,
                                lineStyle: lineInfo.lineStyle,
                                lineWidth: lineInfo.lineWidth,
                                lineColor: lineInfo.lineColor,
                                symbolFillStyle: lineInfo.symbolFillStyle || lineInfo.lineColor,
                                symbolStrokeStyle: lineInfo.symbolStrokeStyle || lineInfo.lineColor,
                                showDataset: lineInfo.showDataset,
                                symbolSize: lineInfo.symbolSize,
                                displayAs: lineInfo.displayAs,
                                autoValueScale: lineInfo.autoValueScale,
                                showHeader: lineInfo.showHeader,
                                symbolLineDash: lineInfo.symbolLineDash,
                                symbolLineWidth: lineInfo.symbolLineWidth,
                                wrapMode: lineInfo.wrapMode,
                                symbolName: lineInfo.symbolName
                            }).then(l => {
                                resolve();
                            }).catch(function (err) {
                                resolve();
                            });
                        }
                    });
                });
            }
        });
    })
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
                                _line.minValue = _.isFinite(lineInfo.minValue) ? lineInfo.minValue : family.family_spec[0].minScale;
                                _line.maxValue = _.isFinite(lineInfo.maxValue) ? lineInfo.maxValue : family.family_spec[0].maxScale;
                            } else {
                                let s1 = JSON.parse(unitConvertData.desUnit.rate);
                                let s2 = JSON.parse(unitConvertData.srcUnit.rate);
                                _line.minValue = _.isFinite(lineInfo.minValue) ? lineInfo.minValue : (parseFloat(family.family_spec[0].minScale) - s1[1]) * (s2[0] / s1[0]) + s2[1];
                                _line.maxValue = _.isFinite(lineInfo.maxValue) ? lineInfo.maxValue: (parseFloat(family.family_spec[0].maxScale) - s1[1]) * (s2[0] / s1[0]) + s2[1];
                            }
                            console.log(family.family_spec[0].minScale);
                            console.log(family.family_spec[0].maxScale);
                            if (!_.isFinite(_line.minValue) || !_.isFinite(_line.maxValue) || !family.family_spec[0]) {
                                console.log("CHANGE VALUE");
                                _line.minValue = curveMinScale;
                                _line.maxValue = curveMaxScale;
                            }
                            _line.idTrack = lineInfo.idTrack;
                            _line.idCurve = curve.idCurve;
                            _line.alias = lineInfo.alias || curve.name;
                            _line.unit = lineInfo.unit || curve.unit;
                            _line.displayMode = lineInfo.displayMode || family.family_spec[0].displayMode;
                            _line.ignoreMissingValues = lineInfo.ignoreMissingValues;
                            _line.displayAs = lineInfo.displayAs;
                            _line.blockPosition = lineInfo.blockPosition || family.family_spec[0].blockPosition;
                            _line.displayType = lineInfo.displayType || family.family_spec[0].displayType;
                            _line.lineStyle = lineInfo.lineStyle || family.family_spec[0].lineStyle;
                            _line.lineWidth = lineInfo.lineWidth || family.family_spec[0].lineWidth;
                            _line.lineColor = lineInfo.lineColor || family.family_spec[0].lineColor;
                            _line.symbolFillStyle = lineInfo.symbolFillStyle || lineInfo.lineColor || family.family_spec[0].lineColor;
                            _line.symbolStrokeStyle = lineInfo.symbolStrokeStyle || lineInfo.lineColor || family.family_spec[0].lineColor;
                            _line.symbolSize = lineInfo.symbolSize;
                            _line.autoValueScale = lineInfo.autoValueScale;
                            _line.orderNum = lineInfo.orderNum;
                            _line.showDataset = lineInfo.showDataset;
                            _line.showHeader = lineInfo.showHeader;
                            _line.createdBy = lineInfo.createdBy;
                            _line.updatedBy = lineInfo.updatedBy;
                            _line.symbolLineDash = lineInfo.symbolLineDash;
                            _line.symbolLineWidth = lineInfo.symbolLineWidth;
                            _line.wrapMode = lineInfo.wrapMode;
                            _line.symbolName = lineInfo.symbolName
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
                            alias: lineInfo.alias || curve.name,
                            minValue: _.isFinite(lineInfo.minValue) ? lineInfo.minValue : curveMinScale,
                            maxValue: _.isFinite(lineInfo.maxValue) ? lineInfo.maxValue : curveMaxScale,
                            ignoreMissingValues: lineInfo.ignoreMissingValues,
                            orderNum: lineInfo.orderNum,
                            createdBy: lineInfo.createdBy,
                            updatedBy: lineInfo.updatedBy,
                            unit: lineInfo.unit || curve.unit || 'N/A',
                            displayMode: lineInfo.displayMode,
                            blockPosition: lineInfo.blockPosition,
                            displayType: lineInfo.displayType,
                            lineStyle: lineInfo.lineStyle,
                            lineWidth: lineInfo.lineWidth,
                            lineColor: lineInfo.lineColor,
                            symbolFillStyle: lineInfo.symbolFillStyle || lineInfo.lineColor,
                            symbolStrokeStyle: lineInfo.symbolStrokeStyle || lineInfo.lineColor,
                            showDataset: lineInfo.showDataset,
                            symbolSize: lineInfo.symbolSize,
                            displayAs: lineInfo.displayAs,
                            autoValueScale: lineInfo.autoValueScale,
                            showHeader: lineInfo.showHeader,
                            symbolLineDash: lineInfo.symbolLineDash,
                            symbolLineWidth: lineInfo.symbolLineWidth,
                            wrapMode: lineInfo.wrapMode,
                            symbolName: lineInfo.symbolName
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
