// var models = require('../models');
// var Track = models.Track;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var fs = require('fs');
var asyncLoop = require('node-async-loop');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var path = require('path');

function createNewTrack(trackInfo, done, dbConnection) {
    var Track = dbConnection.Track;
    Track.sync()
        .then(
            function () {
                var track = Track.build({
                    idPlot: trackInfo.idPlot,
                    orderNum: trackInfo.orderNum
                });
                track.save()
                    .then(function (track) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Track success", {
                            idTrack: track.idTrack,
                            orderNum: track.orderNum
                        }));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Track " + err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editTrack(trackInfo, done, dbConnection) {
    var Track = dbConnection.Track;
    Track.findById(trackInfo.idTrack)
        .then(function (track) {
            track.idPlot = trackInfo.idPlot;
            track.orderNum = trackInfo.orderNum;
            track.showTitle = trackInfo.showTitle;
            track.title = trackInfo.title;
            track.topJustification = trackInfo.topJustification;
            track.bottomJustification = trackInfo.bottomJustification;
            track.showLabels = trackInfo.showLabels;
            track.showValueGrid = trackInfo.showValueGrid;
            track.majorTicks = trackInfo.majorTicks;
            track.minorTicks = trackInfo.minorTicks;
            track.showDepthGrid = trackInfo.showDepthGrid;
            track.width = trackInfo.width;
            track.color = trackInfo.color;
            track.showEndLabels = trackInfo.showEndLabels;

            track.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit track success", trackInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit track" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for edit"))
        });
}

function deleteTrack(trackInfo, done, dbConnection) {
    var Track = dbConnection.Track;
    Track.findById(trackInfo.idTrack)
        .then(function (track) {
            track.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Track is deleted", track));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Track " + err.errors[0].message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for delete"));
        })
}

function getTrackInfo(track, done, dbConnection) {
    var Track = dbConnection.Track;
    Track.findById(track.idTrack, {include: [{all: true}]})
        .then(function (track) {
            if (!track) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Track success", track));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for get info"));
        })
}

let findDatasetName = function (idDataset, dbConnection) {
    return new Promise(function (resolve, reject) {
        let Dataset = dbConnection.Dataset;
        Dataset.findById(idDataset).then(dataset => {
            resolve(dataset.name);
        }).catch(err => {
            reject(null);
        })
    });
}
let exportData = function (payload, done, error, dbConnection, username) {
    let Track = dbConnection.Track;
    let tempfile = require('tempfile')('.json');
    Track.findById(payload.idTrack, {
        include: [{
            model: dbConnection.Line,
            include: {model: dbConnection.Curve}
        }, {
            model: dbConnection.Shading,
            include: [{model: dbConnection.Line, as: 'leftLine'}, {model: dbConnection.Line, as: 'rightLine'}]
        }, {
            model: dbConnection.Marker
        }, {
            model: dbConnection.Image
        }, {
            model: dbConnection.Annotation
        }]
    }).then(async(track => {
        let myTrack = track.toJSON();
        delete myTrack.idTrack;
        delete myTrack.createdAt;
        delete myTrack.updatedAt;
        asyncLoop(myTrack.lines, function (line, next) {
            if (line) {
                findDatasetName(line.curve.idDataset, dbConnection).then(datasetName => {
                    line.datasetName = datasetName;
                    line.curveName = line.curve.name;
                    delete line.curve;
                    delete line.idTrack;
                    delete line.idCurve;
                    next();
                }).catch(err => {
                    next(err);
                });
            } else {
                next();
            }
        }, function (err) {
            asyncLoop(track.shadings, function (shading, next) {
                next();
            }, function (err) {
                fs.writeFileSync(tempfile, JSON.stringify(myTrack));
                done(200, tempfile);
            });

        });
    })).catch(err => {
        console.log(err);
    })
}
let createTrack = function (myTrack, dbConnection, callback) {
    let Track = dbConnection.Track;
    Track.create({
        orderNum: myTrack.orderNum,
        showTitle: myTrack.showTitle,
        title: myTrack.title,
        topJustification: myTrack.topJustification,
        bottomJustification: myTrack.bottomJustification,
        showLabels: myTrack.showLabels,
        showValueGrid: myTrack.showValueGrid,
        majorTicks: myTrack.majorTicks,
        minorTicks: myTrack.minorTicks,
        showDepthGrid: myTrack.showDepthGrid,
        width: myTrack.width,
        color: myTrack.color,
        showEndLabels: myTrack.showEndLabels,
        labelFormat: myTrack.labelFormat,
        idPlot: myTrack.idPlot
    }).then(track => {
        callback(track.idTrack);
    }).catch(err => {
        console.log(err);
        callback(null);
    })
}
let findCurve = function (curveInfo, dbConnection, callback) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let idCurve = null;
    Dataset.findOne({
        where: {
            idWell: curveInfo.idWell,
            name: curveInfo.datasetName
        }
    }).then(dataset => {
        if (dataset) {
            Curve.findOne({
                where: {
                    idDataset: dataset.idDataset,
                    name: curveInfo.name
                }
            }).then(curve => {
                if (curve) {
                    idCurve = curve.idCurve;
                    callback(null, idCurve);
                } else {
                    console.log("NO CURVE");
                    callback({curve: curveInfo.name, dataset: curveInfo.datasetName}, null);
                }
            });
        } else {
            callback({curve: curveInfo.name, dataset: curveInfo.datasetName}, null);
        }
    });
}
let createLine = function (lineInfo, dbConnection, callback) {
    let Line = dbConnection.Line;
    Line.create({
        showHeader: lineInfo.showHeader,
        showDataset: lineInfo.showDataset,
        minValue: lineInfo.minValue,
        maxValue: lineInfo.maxValue,
        autoValueScale: lineInfo.autoValueScale,
        displayMode: lineInfo.displayMode,
        wrapMode: lineInfo.wrapMode,
        blockPosition: lineInfo.blockPosition,
        ignoreMissingValues: lineInfo.ignoreMissingValues,
        displayType: lineInfo.displayType,
        displayAs: lineInfo.displayAs,
        lineStyle: lineInfo.lineStyle,
        lineWidth: lineInfo.lineWidth,
        lineColor: lineInfo.lineColor,
        symbolName: lineInfo.symbolName,
        symbolSize: lineInfo.symbolSize,
        symbolLineWidth: lineInfo.symbolLineWidth,
        symbolStrokeStyle: lineInfo.symbolStrokeStyle,
        symbolFillStyle: lineInfo.symbolFillStyle,
        symbolLineDash: lineInfo.symbolLineDash,
        alias: lineInfo.alias,
        unit: lineInfo.unit,
        idCurve: lineInfo.idCurve,
        idTrack: lineInfo.idTrack
    }).then(line => {
        callback(line.idLine);
    }).catch(err => {
        console.log(err);
        callback(null);
    })
}
let findLine = function (lineInfo, dbConnection, callback) {
    let Line = dbConnection.Line;
    Line.findOne({
        where: {alias: lineInfo.alias, idTrack: lineInfo.idTrack}
    }).then(line => {
        if (line) {
            callback(line.idLine);
        } else {
            callback(null);
        }
    }).catch(err => {
        console.log(err);
        callback(null);
    })
}
let createShading = function (shadingInfo, dbConnection, callback) {
    let Shading = dbConnection.Shading;
    Shading.create({
        name: shadingInfo.name,
        leftFixedValue: shadingInfo.leftFixedValue,
        rightFixedValue: shadingInfo.rightFixedValue,
        negativeFill: shadingInfo.negativeFill,
        fill: shadingInfo.fill,
        positiveFill: shadingInfo.positiveFill,
        isNegPosFill: shadingInfo.isNegPosFill,
        idTrack: shadingInfo.idTrack,
        idLeftLine: shadingInfo.idLeftLine,
        idRightLine: shadingInfo.idRightLine,
        idControlCurve: null
    }).then(shading => {
        callback(shading.idShading);
    }).catch(err => {
        callback(null);
    });
}
let importTrackTemplate = function (req, done, dbConnection) {
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType != 'track') {
        fs.unlink(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .track files allowed!"));
    }
    let isCurveNotFound = false;
    let curveHasError = new Array();
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
        } else {
            let myTrack = JSON.parse(data);
            myTrack.idPlot = req.body.idPlot;
            // console.log(myTrack);
            createTrack(myTrack, dbConnection, function (idTrack) {
                if (idTrack) {
                    asyncLoop(myTrack.lines, function (line, next) {
                        let Line = dbConnection.Line;
                        let curveInfo = {
                            idWell: req.body.idWell,
                            datasetName: line.datasetName,
                            name: line.curveName
                        }
                        findCurve(curveInfo, dbConnection, function (err, idCurve) {
                            if (idCurve) {
                                console.log("FOUND CURVE : ", idCurve);
                                line.idCurve = idCurve;
                                line.idTrack = idTrack;
                                createLine(line, dbConnection, function (idLine) {
                                    if (line) {
                                        console.log("DONE LINE ", idLine);
                                    }
                                    next();
                                })
                            } else {
                                isCurveNotFound = true;
                                curveHasError.push({curve: line.curveName, dataset: line.datasetName});
                                next();
                            }
                        });
                    }, function (err) {
                        console.log("ALL LINE DONE");
                        asyncLoop(myTrack.shadings, function (shading, next) {
                            if (!shading) shading = {};
                            shading.idTrack = idTrack;
                            findLine({
                                idTrack: idTrack,
                                alias: shading.leftLine ? shading.leftLine.alias : null
                            }, dbConnection, function (idLine) {
                                shading.idLeftLine = idLine;
                                findLine({
                                    idTrack: idTrack,
                                    alias: shading.rightLine ? shading.rightLine.alias : null
                                }, dbConnection, function (idLine) {
                                    shading.idRightLine = idLine;
                                    createShading(shading, dbConnection, function () {
                                        next();
                                    });
                                });
                            });

                        }, function (err) {
                            console.log("ALL SHADING DONE");
                            asyncLoop(myTrack.markers, function (marker, next) {
                                if (!marker) marker = {};
                                delete marker.idMarker;
                                marker.idTrack = idTrack;
                                dbConnection.Marker.create(marker).then(() => {
                                    next();
                                }).catch(() => {
                                    next();
                                });
                            }, function (err) {
                                console.log("ALL MARKER DONE");
                                asyncLoop(myTrack.images, function (image, next) {
                                    if (!image) image = {};
                                    delete image.idImage;
                                    image.idTrack = idTrack;
                                    dbConnection.Image.create(image).then(() => {
                                        next();
                                    }).catch(() => {
                                        next();
                                    })
                                }, function (err) {
                                    console.log("ALL IMAGE DONE");
                                    asyncLoop(myTrack.annotations, function (annotation, next) {
                                        if (!annotation) annotation = {};
                                        delete annotation.idAnnotation;
                                        annotation.idTrack = idTrack;
                                        dbConnection.Annotation.create(annotation).then(() => {
                                            next();
                                        }).catch(() => {
                                            next();
                                        });
                                    }, function (err) {
                                        console.log("ALL ANNOTATION DONE");
                                        dbConnection.Track.findById(idTrack).then(track => {
                                            if(isCurveNotFound){
                                                done(ResponseJSON(ErrorCodes.SUCCESS, "CURVE_NOT_FOUND", curveHasError));
                                            } else {
                                                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", track));
                                            }
                                        }).catch(err => {
                                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Done"));
                                        });

                                    });
                                })
                            });
                        });
                    });
                } else {
                    console.log("NO TRACK CREATE");
                }
            });
        }
    });

}

module.exports = {
    createNewTrack: createNewTrack,
    deleteTrack: deleteTrack,
    editTrack: editTrack,
    getTrackInfo: getTrackInfo,
    exportData: exportData,
    importTrackTemplate: importTrackTemplate
};
