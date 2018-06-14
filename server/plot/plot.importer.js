const path = require('path');
const fs = require('fs');
const async = require('async');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let createdBy;
let updatedBy;

function getCurveByName(curve, dbConnection) {
    return new Promise(function (resolve) {
        dbConnection.Well.findOne({where: {name: curve.well}}).then(well => {
            if (!well) return resolve(null);
            dbConnection.Dataset.findOne({where: {name: curve.dataset, idWell: well.idWell}}).then(dataset => {
                if (!dataset) return resolve(null);
                dbConnection.Curve.findOne({where: {name: curve.curve}, idDataset: dataset.idDataset}).then(curve => {
                    if (!curve) return resolve(null);
                    resolve(curve);
                });
            });
        });
    });
}

function createTrack(object, dbConnection) {
    return dbConnection.Track.create({
        "orderNum": object.orderNum,
        "showTitle": object.showTitle,
        "title": object.title,
        "topJustification": object.topJustification,
        "bottomJustification": object.bottomJustification,
        "showLabels": object.showLabels,
        "showValueGrid": object.showValueGrid,
        "majorTicks": object.majorTicks,
        "minorTicks": object.minorTicks,
        "showDepthGrid": object.showDepthGrid,
        "width": object.width,
        "color": object.color,
        "showEndLabels": object.showEndLabels,
        "labelFormat": object.label,
        "zoomFactor": object.zoomFactor,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idPlot": object.idPlot,
    });
}

function createDepthAxis(object, dbConnection) {
    return dbConnection.DepthAxis.create({
        "showTitle": object.showTitle,
        "title": object.title,
        "idPlot": object.idPlot,
        "justification": object.justification,
        "depthType": object.depthType,
        "unitType": object.unitType,
        "decimals": object.decimal,
        "trackBackground": object.trackBackground,
        "geometryWidth": object.geometryWidth,
        "orderNum": object.orderNum,
        "width": object.width,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
    });
}

function createImageTrack(object, dbConnection) {
    return dbConnection.ImageTrack.create({
        "showTitle": object.showTitle,
        "title": object.title,
        "topJustification": object.topJustification,
        "orderNum": object.orderNum,
        "background": object.background,
        "width": object.width,
        "zoomFactor": object.zoomFactor,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idPlot": object.idPlot,
    });
}

function createZoneTrack(object, dbConnection) {
    return dbConnection.ZoneTrack.create({
        "showTitle": object.showTitle,
        "title": object.title,
        "topJustification": object.topJustification,
        "bottomJustification": object.bottomJustification,
        "orderNum": object.orderNum,
        "color": object.color,
        "width": object.width,
        "zoomFactor": object.zoomFactor,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idPlot": object.idPlot,
        "idZoneSet": object.idZoneSet ? object.idZoneSet : null
    });
}

function createObjectTrack(object, dbConnection) {
    return dbConnection.ObjectTrack.create({
        "showTitle": object.showTitle,
        "title": object.title,
        "topJustification": object.topJustification,
        "orderNum": object.orderNum,
        "width": object.width,
        "zoomFactor": object.zoomFactor,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idPlot": object.idPlot,
    });
}

function createLine(object, dbConnection) {
    return dbConnection.Line.create({
        "showHeader": object.showHeader,
        "showDataset": object.showDataset,
        "minValue": object.minValue,
        "maxValue": object.maxValue,
        "autoValueScale": object.autoValueScale,
        "displayMode": object.displayMode,
        "wrapMode": object.wrapMode,
        "blockPosition": object.blockPosition,
        "ignoreMissingValues": object.ignoreMissingValues,
        "displayType": object.displayType,
        "displayAs": object.displayAs,
        "lineStyle": object.lineStyle,
        "lineWidth": object.lineWidth,
        "lineColor": object.lineColor,
        "symbolName": object.symbolName,
        "symbolSize": object.symbolSize,
        "symbolLineWidth": object.symbolLineWidth,
        "symbolStrokeStyle": object.symbolStrokeStyle,
        "symbolFillStyle": object.symbolFillStyle,
        "symbolLineDash": object.symbolLineDash,
        "alias": object.alias,
        "unit": object.unit,
        "orderNum": object.orderNum,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idTrack": object.idTrack,
        "idCurve": object.idCurve,
    });
}

function createShading(object, dbConnection) {
    return dbConnection.Shading.create({
        "name": object.name,
        "leftFixedValue": object.leftFixedValue,
        "rightFixedValue": object.rightFixedValue,
        "negativeFill": object.negativeFill,
        "fill": object.fill,
        "positiveFill": object.positiveFill,
        "isNegPosFill": object.isNegPosFill,
        "orderNum": object.orderNum,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idTrack": object.idTrack,
        "idLeftLine": object.idLeftLine,
        "idRightLine": object.idRightLine,
        "idControlCurve": object.idControlCurve,
    });
}

function createMarker(object, dbConnection) {
    return dbConnection.Marker.create({
        "name": object.name,
        "nameHAlign": object.nameHAlign,
        "nameVAlign": object.nameVAlign,
        "depth": object.depth,
        "precision": object.precision,
        "depthHAlign": object.depthHAlign,
        "depthVAlign": object.depthVAlign,
        "lineWidth": object.lineWidth,
        "lineDash": object.lineDash,
        "lineColor": object.lineColor,
        "showSymbol": object.showSymbol,
        "symbolName": object.symbolName,
        "symbolSize": object.symbolSize,
        "symbolStrokeStyle": object.symbolStrokeStyle,
        "symbolFillStyle": object.symbolFillStyle,
        "symbolLineWidth": object.symbolLineWidth,
        "symbolLineDash": object.symbolLineDash,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idTrack": object.idTrack
    });
}

function createAnnotation(object, dbConnection) {
    return dbConnection.Annotation.create({
        "textStyle": object.textStyle,
        "text": object.text,
        "vAlign": object.vAlign,
        "hAlign": object.hAlign,
        "background": object.background,
        "fitBounds": object.fitBounds,
        "deviceSpace": object.deviceSpace,
        "vertical": object.vertical,
        "shadow": object.shadow,
        "left": object.left,
        "width": object.width,
        "top": object.top,
        "bottom": object.bottom,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idTrack": object.idTrack
    });
}

function createImageOftrack(object, dbConnection) {
    return dbConnection.ImageOfTrack.create({
        "name": object.name,
        "fill": object.fill,
        "showName": object.showName,
        "imageUrl": object.imageUrl,
        "topDepth": object.topDepth,
        "bottomDepth": object.bottomDepth,
        "left": object.left,
        "right": object.right,
        "smartDisplay": object.smartDisplay,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idImageTrack": object.idImageTrack
    });
}

function createObjectOftrack(object, dbConnection) {
    return dbConnection.ObjectOfTrack.create({
        "object": object.object,
        "topDepth": object.topDepth,
        "bottomDepth": object.bottomDepth,
        "left": object.left,
        "right": object.right,
        "createdBy": createdBy,
        "updatedBy": updatedBy,
        "idObjectTrack": object.idObjectTrack
    });
}

function processTrackChild(trackObj, newTrack, dbConnection) {
    return new Promise(function (resolve, reject) {
        async.series([
                function (cb) {
                    async.each(trackObj.lines, function (line, nextLine) {
                        getCurveByName(line.curve, dbConnection).then(curve => {
                            if (curve) {
                                line.idTrack = newTrack.idTrack;
                                line.idCurve = curve.idCurve;
                                createLine(line, dbConnection).then(() => {
                                    nextLine();
                                }).catch(err => {
                                    console.log(err);
                                    nextLine();
                                })
                            } else {
                                nextLine();
                            }
                        })
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    async.each(trackObj.shadings, function (shading, nextShading) {
                        shading.idTrack = newTrack.idTrack;
                        async.series([
                            function (cb) {
                                getCurveByName(shading.control_curve, dbConnection).then(curve => {
                                    shading.idControlCurve = curve ? curve.idCurve : null;
                                    cb();
                                });
                            },
                            function (cb) {
                                console.log(shading);
                                if (shading.left_line) {
                                    dbConnection.Line.findOne({
                                        where: {alias: shading.left_line.alias, idTrack: newTrack.idTrack}
                                    }).then(ln => {
                                        shading.idLeftLine = ln ? ln.idLine : null;
                                        cb();
                                    });
                                } else {
                                    cb();
                                }
                            },
                            function (cb) {
                                if (shading.right_line) {
                                    dbConnection.Line.findOne({
                                        where: {alias: shading.right_line.alias, idTrack: newTrack.idTrack}
                                    }).then(ln => {
                                        shading.idRightLine = ln ? ln.idLine : null;
                                        cb();
                                    });
                                } else {
                                    cb();
                                }
                            }
                        ], function () {
                            createShading(shading, dbConnection).then(() => {
                                nextShading();
                            }).catch(err => {
                                console.log(err);
                                nextShading();
                            })
                        });
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    async.each(trackObj.markers, function (marker, nextMarker) {
                        marker.idTrack = newTrack.idTrack;
                        createMarker(marker, dbConnection).then(() => {
                            nextMarker();
                        }).catch(err => {
                            console.log(err);
                            nextMarker();
                        });
                    }, function () {
                        cb();
                    });
                }, function (cb) {
                    async.each(trackObj.annotations, function (annotation, nextAnnotation) {
                        annotation.idTrack = newTrack.idTrack;
                        createAnnotation(annotation, dbConnection).then(() => {
                            nextAnnotation();
                        }).catch(err => {
                            console.log(err);
                            nextAnnotation();
                        })
                    }, function () {
                        cb();
                    });
                }
            ],
            function () {
                resolve();
            });
    });
}


module.exports = function (req, done, dbConnection) {
    createdBy = req.createdBy;
    updatedBy = req.updatedBy;
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType !== 'plot') {
        fs.unlinkSync(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .plot files allowed!"));
    }
    fs.readFile(filePath, 'utf8', async function (err, data) {
        if (err) console.log(err);
        let myPlot = JSON.parse(data);
        let refCurve = await getCurveByName(myPlot.reference_curve, dbConnection);
        dbConnection.Plot.create({
            "name": req.body.plotName ? req.body.plotName : myPlot.name,
            "option": myPlot.option,
            "duplicated": 1,
            "currentState": myPlot.currentState,
            "cropDisplay": myPlot.cropDisplay,
            "createdBy": createdBy,
            "updatedBy": updatedBy,
            "idProject": req.body.idProject,
            "referenceCurve": refCurve ? refCurve.idCurve : null
        }).then((newPlot) => {
            async.parallel([
                function (cb) {
                    async.each(myPlot.tracks, function (track, nextTrack) {
                        track.idPlot = newPlot.idPlot;
                        createTrack(track, dbConnection).then(newTrack => {
                            processTrackChild(track, newTrack, dbConnection).then(() => {
                                nextTrack();
                            }).catch(err => {
                                console.log(err);
                                nextTrack();
                            });
                        }).catch(err => {
                            console.log(err);
                            nextTrack();
                        });
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    async.each(myPlot.depth_axes, function (depth_axis, nextTrack) {
                        depth_axis.idPlot = newPlot.idPlot;
                        createDepthAxis(depth_axis, dbConnection).then(() => {
                            nextTrack();
                        }).catch(err => {
                            console.log(err);
                            nextTrack();
                        });
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    async.each(myPlot.image_tracks, function (image_track, nextTrack) {
                        image_track.idPlot = newPlot.idPlot;
                        createImageTrack(image_track, dbConnection).then((img_track) => {
                            async.each(image_track.image_of_tracks, function (image, nextImg) {
                                image.idImageTrack = img_track.idImageTrack;
                                createImageOftrack(image, dbConnection).then(() => {
                                    nextImg();
                                }).catch(err => {
                                    console.log(err);
                                    nextImg();
                                });
                            }, function () {
                                nextTrack();
                            });
                        }).catch(err => {
                            console.log(err);
                            nextTrack();
                        });
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    async.each(myPlot.object_tracks, function (object_track, nextTrack) {
                        object_track.idPlot = newPlot.idPlot;
                        createObjectTrack(object_track, dbConnection).then(obj_track => {
                            async.each(object_track.object_of_tracks, function (obj, nextObj) {
                                console.log("===", obj);
                                obj.idObjectTrack = obj_track.idObjectTrack;
                                createObjectOftrack(obj, dbConnection).then(() => {
                                    nextObj();
                                }).catch(err => {
                                    console.log(err);
                                    nextObj();
                                });
                            }, function () {
                                nextTrack();
                            });
                        }).catch(err => {
                            console.log(err);
                            nextTrack();
                        });
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    async.each(myPlot.zone_tracks, function (zone_track, nextTrack) {
                        zone_track.idPlot = newPlot.idPlot;
                        createZoneTrack(zone_track, dbConnection).then(() => {
                            nextTrack();
                        }).catch(err => {
                            console.log(err);
                            nextTrack();
                        });
                    }, function () {
                        cb();
                    });
                }
            ], function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", newPlot));
            })
        }).catch(err => {
            if (err.name === "SequelizeUniqueConstraintError") {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        })
    });
};