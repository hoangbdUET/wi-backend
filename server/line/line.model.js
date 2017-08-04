var models = require('../models');
var Line = models.Line;
var ErrorCodes = require('../../error-codes').CODES;
var Curve=models.Curve;
const ResponseJSON = require('../response');

function createNewLine(lineInfo, done) {
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
                                    alias:curve.name,
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
                            .catch(function () {
                                console.log("HERRR");
                                Line.build({
                                    idTrack: lineInfo.idTrack,
                                    idCurve: curve.idCurve,
                                }).save()
                                    .then(function (line) {
                                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line.toJSON()));
                                    })
                                    .catch(function (err) {
                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name + " idTrack not exist"));
                                    });
                            });
                    })
                    .catch(function () {
                        done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Curve not found for Create New Line"));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}
function editLine(lineInfo, done) {
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

            line.showHeader= lineInfo.showHeader;
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
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Line "+err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Line not found for edit"));
        })
}
function deleteLine(lineInfo,done) {
    Line.findById(lineInfo.idLine)
        .then(function (line) {
            line.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Line is deleted", line));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Line"+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for delete"));
        })
}
function getLineInfo(line,done) {
    Line.findById(line.idLine,{include:[{all:true,include:[{all:true}]}]})
        .then(function (line) {
            if (!line) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Line success", line));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for get info"));
        })
}

module.exports = {
    createNewLine:createNewLine,
    editLine:editLine,
    deleteLine:deleteLine,
    getLineInfo:getLineInfo
};
