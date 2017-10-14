// var models = require('../models');
// var Plot = models.Plot;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
//var async = require('async');
// const async = require('promise-async')
var asyncLoop = require('node-async-loop');
var exporter = require('./exporter');
var fs = require('fs');
var path = require('path');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var myAsync = require('async');
var lineModel = require('../line/line.model');
let findFamilyIdByName = function (familyName, dbConnection, callback) {
    dbConnection.Family.findOne({where: {name: familyName}}).then(family => {
        if (family) {
            // console.log("FOUND FAMILY : ", familyName);
            callback(family.idFamily);
        } else {
            // console.log("NO FAMILY FOUND : ", familyName);
            callback(null);
        }
    }).catch((err) => {
        console.log(err);
        callback(null);
    })
}

let createPlotTemplate = function (myPlot, dbConnection, callback, username) {
    let familyWithErr = [];
    dbConnection.Plot.create({
        idWell: myPlot.idWell,
        name: myPlot.name,
        option: myPlot.option,
        referenceCurve: myPlot.referenceCurve
    }).then(plot => {
        let idPlot = plot.idPlot;
        asyncLoop(myPlot.depth_axes, function (depth_axis, next) {
            depth_axis.idPlot = idPlot;
            dbConnection.DepthAxis.create(depth_axis).then(() => {
                next();
            }).catch(err => {
                next(err);
            });
        }, function (err) {
            asyncLoop(myPlot.tracks, function (track, next) {
                track.idPlot = idPlot;
                dbConnection.Track.create({
                    idPlot: track.idPlot,
                    orderNum: track.orderNum,
                    title: track.title
                }).then(t => {
                    let idTrack = t.idTrack;
                    asyncLoop(track.lines, function (line, next) {
                        asyncLoop(line.families, function (family, next) {
                            findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                                console.log("ID FAMILY ", idFamily);
                                if (idFamily) {
                                    dbConnection.Curve.findOne({where: {idFamily: idFamily}}).then(curve => {
                                        if (curve) {
                                            // console.log("FOUND CURVE : NEXT ", curve.name);
                                            next(curve);
                                        } else {
                                            // console.log("NOT FOUND CURVE NEXT");
                                            familyWithErr.push(family.name);
                                            next();
                                        }
                                    });
                                } else {
                                    next();
                                }
                            });
                        }, function (curve) {
                            if (curve) {
                                lineModel.createNewLineWithoutResponse({
                                    idCurve: curve.idCurve,
                                    idTrack: idTrack
                                }, dbConnection, username, function (line) {
                                    if (line) {
                                        next(line);
                                    } else {
                                        next("ERR WHEN CREATE LINE");
                                    }
                                });
                            } else {
                                next();
                            }
                        });
                    }, function (line) {
                        next();
                    });
                }).catch(err => {
                    next(err);
                });
            }, function (err) {
                if (err) console.log(err);
                console.log("DONE ALL, CALLBACK");
                callback(null, {familiesWithoutCurve: familyWithErr});
            });
        });
    }).catch(err => {
        console.log(err.message);
        callback(err, null);
    });
}

function createNewPlot(plotInfo, done, dbConnection, username) {
    var Plot = dbConnection.Plot;
    if (plotInfo.plotTemplate) {
        if (plotInfo.plotTemplate == "DensityNeutron") {
            let myPlot = require('./plot-template/DensityNeutron.json');
            myPlot.referenceCurve = plotInfo.referenceCurve;
            myPlot.idWell = plotInfo.idWell;
            myPlot.name = plotInfo.name ? plotInfo.name : myPlot.name;
            createPlotTemplate(myPlot, dbConnection, function (err, result) {
                if (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed", err.message));
                } else {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create " + plotInfo.plotTemplate + " successful", result));
                }
            }, username);
        } else if (plotInfo.plotTemplate == "ResistivitySonic") {
            let myPlot = require('./plot-template/ResistivitySonic.json');
            myPlot.referenceCurve = plotInfo.referenceCurve;
            myPlot.idWell = plotInfo.idWell;
            myPlot.name = plotInfo.name ? plotInfo.name : myPlot.name;
            createPlotTemplate(myPlot, dbConnection, function (err, result) {
                if (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed", err.message));
                } else {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create " + plotInfo.plotTemplate + " successful", result));
                }
            }, username);
        } else if (plotInfo.plotTemplate == "TripleCombo") {
            let myPlot = require('./plot-template/TripleCombo.json');
            myPlot.referenceCurve = plotInfo.referenceCurve;
            myPlot.idWell = plotInfo.idWell;
            myPlot.name = plotInfo.name ? plotInfo.name : myPlot.name;
            createPlotTemplate(myPlot, dbConnection, function (err, result) {
                if (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed", err.message));
                } else {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create " + plotInfo.plotTemplate + " successful", result));
                }
            }, username);
        } else {
            console.log("ANOTHER TEMPLATE TYPE");
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Plot err", "NOT TEMPLATE"));
        }
    } else {
        Plot.sync()
            .then(
                function () {
                    var plot = Plot.build({
                        idWell: plotInfo.idWell,
                        name: plotInfo.name,
                        referenceCurve: plotInfo.referenceCurve,
                        option: plotInfo.option
                    });
                    plot.save()
                        .then(function (plot) {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Plot success", plot.toJSON()));
                        })
                        .catch(function (err) {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Plot " + err.name));
                        })
                },
                function () {
                    done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
                }
            )
    }
}

function editPlot(plotInfo, done, dbConnection) {
    var Plot = dbConnection.Plot;
    Plot.findById(plotInfo.idPlot)
        .then(function (plot) {
            plot.idWell = plotInfo.idWell;
            plot.name = plotInfo.name;
            plot.referenceCurve = plotInfo.referenceCurve;
            plot.option = plotInfo.option;
            plot.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Plot success", plotInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Plot " + err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for edit"));
        })
}

function deletePlot(plotInfo, done, dbConnection) {
    var Plot = dbConnection.Plot;
    Plot.findById(plotInfo.idPlot)
        .then(function (plot) {
            plot.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Plot is deleted", plot));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Plot " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for delete"));
        })
}

function getPlotInfo(plot, done, dbConnection) {
    var Plot = dbConnection.Plot;
    Plot.findById(plot.idPlot, {include: [{all: true, include: [{all: true}]}]})
        .then(function (plot) {
            if (!plot) throw "not exists";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Plot success", plot));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for get info"));
        })
}

function createLineForDuplicate(lineInfos, dbConnection, callback) {
    let Line = dbConnection.Line;
    let idArray = new Array();
    if (lineInfos.length > 0) {
        asyncLoop(lineInfos, function (lineInfo, next) {
            let bk = lineInfo.idLine;
            delete lineInfo.idLine;
            Line.create(lineInfo).then(line => {
                idArray[bk] = line.idLine;
                next();
            }).catch(err => {
                next(err);
            });
        }, function (err) {
            if (err) callback(err, null);
            callback(null, idArray);
        });
    } else {
        callback("No line", null);
    }
}

function createMarkerForDuplicate(markerInfos, dbConnection, callback) {
    let Marker = dbConnection.Marker;
    if (markerInfos.length > 0) {
        asyncLoop(markerInfos, function (markerInfo, next) {
            Marker.create(markerInfo).then(marker => {
                next()
            }).catch(err => {
                next(err);
            });
        }, function (err) {
            if (err) callback(err, null);
            callback(null, "DONE MARKER");
        })
    } else {
        callback("No Maker", null);
    }
}

function createShaingForDuplicate(shadingInfos, dbConnection, callback) {
    let Shading = dbConnection.Shading;
    if (shadingInfos.length > 0) {
        asyncLoop(shadingInfos, function (shadingInfo, next) {
            Shading.create(shadingInfo).then(shaing => {
                next();
            }).catch(err => {
                next(err);
            })
        }, function (err) {
            if (err) callback(err, null);
            callback(null, "DONE SHADING");
        });
    } else {
        callback("NO Shading", null);
    }
}

function duplicatePlot(payload, done, dbConnection) {
    let Plot = dbConnection.Plot;
    let Track = dbConnection.Track;
    let Shading = dbConnection.Shading;
    let Marker = dbConnection.Marker;
    let Line = dbConnection.Line;
    let Annotation = dbConnection.Annotation;
    let Image = dbConnection.Image;
    let DepthAxis = dbConnection.DepthAxis;
    let ZoneTrack = dbConnection.ZoneTrack;
    let Curve = dbConnection.Curve;
    Plot.findById(payload.idPlot, {include: [{all: true, include: [{all: true}]}]}).then(rs => {
        let plot = rs.toJSON();
        delete plot.idPlot;
        if (plot.name.indexOf('_') != -1) {
            plot.name = plot.name.substring(0, plot.name.indexOf('_'));
        }
        plot.name = plot.name + "_" + Date.now();
        plot.idWell = payload.idWell;
        Plot.create(plot).then(rs => {
            console.log("DONE PLOT");
            let tracks = plot.tracks.length != 0 ? plot.tracks : [];
            if (tracks.length > 0) {
                asyncLoop(tracks, function (track, next) {
                    delete track.idTrack;
                    track.idPlot = rs.idPlot;
                    Track.create(track).then(rs => {
                        let lines = track.lines.length != 0 ? track.lines : [];
                        if (lines.length > 0) {
                            lines.forEachDone(line => {
                                //delete line.idLine;
                                line.idTrack = rs.idTrack;
                            }, function () {
                                createLineForDuplicate(lines, dbConnection, function (err, result) {
                                    let idArray = result;
                                    let markers = track.markers.length != 0 ? track.markers : [];
                                    markers.forEachDone(marker => {
                                        delete marker.idMarker;
                                        marker.idTrack = rs.idTrack;
                                    }, function (err) {
                                        createMarkerForDuplicate(markers, dbConnection, function (err, result) {
                                            console.log(result);
                                        });
                                    });
                                    let shadings = track.shadings.length != 0 ? track.shadings : [];
                                    shadings.forEachDone(shading => {
                                        delete shading.idShading;
                                        shading.idTrack = rs.idTrack;
                                        shading.idLeftLine = idArray[shading.idLeftLine];
                                        shading.idRightLine = idArray[shading.idRightLine];
                                    }, function () {
                                        createShaingForDuplicate(shadings, dbConnection, function (err, result) {
                                            console.log(result);
                                        })
                                    })
                                    next();
                                });
                            });
                        } else {
                            let markers = track.markers.length != 0 ? track.markers : [];
                            markers.forEachDone(marker => {
                                delete marker.idMarker;
                                marker.idTrack = rs.idTrack;
                            }, function (err) {
                                createMarkerForDuplicate(markers, dbConnection, function (err, result) {
                                    console.log(result);
                                });
                            })
                            next();
                        }
                    }).catch(err => {
                        next(err);
                    });
                }, function (errTrack) {
                    console.log("DONE TRACKS");
                    let depth_axes = plot.depth_axes.length != 0 ? plot.depth_axes : [];
                    if (depth_axes.length != 0) {
                        asyncLoop(depth_axes, (depth_axis, next) => {
                            delete depth_axis.idDepthAxis;
                            depth_axis.idPlot = rs.idPlot;
                            DepthAxis.create(depth_axis).then(rs => {
                                // console.log("CREATE DEPTH AXIS");
                                next();
                            }).catch(err => {
                                next(err);
                            });
                        }, err => {
                            if (err) console.log("CREATE DEPTH AXIS ERR" + err);
                            console.log("DONE DEPTH AXES");
                            let zone_tracks = plot.zone_tracks.length != 0 ? plot.zone_tracks : [];
                            if (zone_tracks.length != 0) {
                                asyncLoop(zone_tracks, (zone_track, next) => {
                                    delete zone_track.idZoneTrack;
                                    zone_track.idPlot = rs.idPlot;
                                    ZoneTrack.create(zone_track).then(rs => {
                                        // console.log("CREATE ZONE TRACK");
                                        next();
                                    }).catch(err => {
                                        next(err);
                                    });
                                }, err => {
                                    if (err) console.log("CREATE ZONE TRACK ERR" + err);
                                    console.log("DONE ZONE TRACKS");
                                })
                            } else {
                                // console.log("DAY NA");
                            }
                        });
                    }
                    done(ResponseJSON(ErrorCodes.SUCCESS, "OK"));
                });
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "NO TRACK"));
            }
        }).catch(err => {
            console.log(err);
            done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Error"));
        });
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Error"));
    });
}

let myTestFunc = function () {
    for (let i = 0; i < 90000; i++) {
        console.log(i + 1);
    }
}
let getDatasetName = function (idDataset, dbConnection) {
    let Dataset = dbConnection.Dataset;
    let name = "";
    await(Dataset.findById(idDataset).then(dataset => {
        name = dataset.name;
    }).catch(err => {
        console.log(err);
        name = "";
    }));
    return name;
};
let getLine = function (idLine, dbConnection) {
    let Line = dbConnection.Line;
    let rs = new Object();
    await(Line.findById(idLine).then(line => {
        rs = line;
    }).catch(err => {
        console.log(err);
    }));
    return rs;
}
let exportData = function (payload, done, error, dbConnection, username) {
    let Plot = dbConnection.Plot;
    Plot.findById(payload.idPlot, {
        include: [{
            all: true,
            include: [{all: true, include: [{all: true}]}]
        }]
    }).then(async(rs => {
        let myPlot = rs.toJSON();
        let data = rs.toJSON();
        delete myPlot.createdAt;
        delete myPlot.updatedAt;
        delete myPlot.idPlot;
        if (myPlot.curve) {
            myPlot.curve.datasetName = getDatasetName(myPlot.curve.idDataset, dbConnection);
        }
        myPlot.tracks.forEach(function (track) {
            delete track.idTrack;
            delete track.createdAt;
            delete track.updatedAt;
            track.lines.forEach(function (line) {
                delete line.idLine;
                delete line.updatedAt;
                delete line.createdAt;
                line.curve.datasetName = getDatasetName(line.curve.idDataset, dbConnection);
            });
            track.shadings.forEach(function (shading) {
                delete shading.idShading;
                delete shading.createdAt;
                delete shading.updatedAt;
                delete shading.line;
                shading.leftLine = new Object();
                shading.rightLine = new Object();
                if (shading.idLeftLine != null) {
                    shading.leftLine.alias = getLine(shading.idLeftLine, dbConnection).alias;
                }
                if (shading.idRightLine != null) {
                    shading.rightLine.alias = getLine(shading.idRightLine, dbConnection).alias;
                }
            });
            track.images.forEach(function (image) {
                delete image.idImage;
                delete image.createdAt;
                delete image.updatedAt;
            });
            track.markers.forEach(function (marker) {
                delete marker.idMarker;
                delete marker.createdAt;
                delete marker.updatedAt;
            });
            track.annotations.forEach(function (annotation) {
                delete annotation.idAnnotation;
                delete annotation.createdAt;
                delete annotation.updatedAt;
            });
        });
        myPlot.depth_axes.forEach(function (depth_axis) {
            delete depth_axis.createdAt;
            delete depth_axis.updatedAt;
            delete depth_axis.idDepthAxis;
        });
        myPlot.zone_tracks.forEach(function (zone_track) {
            delete zone_track.idZoneTrack;
            delete zone_track.createdAt;
            delete zone_track.updatedAt;
            if (zone_track.zoneset) {
                delete zone_track.zoneset.idZoneSet;
                delete zone_track.zoneset.createdAt;
                delete zone_track.zoneset.updatedAt;
                if (zone_track.zoneset.zones) {
                    zone_track.zoneset.zones.forEach(function (zone) {
                        delete zone.idZone;
                        delete zone.createdAt;
                        delete zone.updatedAt;
                    });
                }
            }

        });
        await(exporter.exportData(myPlot, done));
    })).catch(err => {
        console.log(err);
    });
};

let createPlot = function (plot, dbConnection) {
    let Plot = dbConnection.Plot;
    let idPlot = null;
    await(Plot.create(plot).then(rs => {
        idPlot = rs.idPlot;
    }).catch(err => {
        console.log(err.message);
    }));
    return idPlot;
};
let findRefCurve = function (curve, dbConnection) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Plot = dbConnection.Plot;
    let idReferenceCurve = 0;
    await(Well.findById(curve.idWell).then(well => {
        Dataset.findAll({
            where: {
                name: curve.datasetName,
                idWell: well.idWell
            }
        }).then(async(dataset => {
            if (dataset.length > 0) {
                //console.log("CURVE : " , curve);
                await(Curve.findAll({
                    where: {
                        name: curve.name,
                        idDataset: dataset[0].idDataset
                    }
                }).then(async(c => {
                    if (c.length > 0) {
                        // console.log("CURVE  : ", c[0]);
                        await(Plot.findById(curve.idPlot).then(plot => {
                            plot.referenceCurve = c[0].idCurve;
                            plot.save().then(rs => {
                                //console.log("UPDATE REFERENCE CURVE");
                                idReferenceCurve = c[0].idCurve;
                            }).catch(err => {
                                console.log(err);
                            });
                        }));
                    } else {
                        console.log("NO CURVE");
                    }
                })).catch(err => {
                    console.log(err);
                }));
            } else {
                console.log("NO DATASET");
            }
        })).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err)
    }));
    return idReferenceCurve;
}

let createTrack = function (trackInfo, idPlot, dbConnection, callback) {
    let Track = dbConnection.Track;
    await(Track.create({
        orderNum: trackInfo.orderNum,
        showTitle: trackInfo.showTitle,
        title: trackInfo.title,
        topJustification: trackInfo.topJustification,
        bottomJustification: trackInfo.bottomJustification,
        showLabels: trackInfo.showLabels,
        showValueGrid: trackInfo.showValueGrid,
        majorTicks: trackInfo.majorTicks,
        minorTicks: trackInfo.minorTicks,
        showDepthGrid: trackInfo.showDepthGrid,
        width: trackInfo.width,
        color: trackInfo.color,
        showEndLabels: trackInfo.showEndLabels,
        labelFormat: trackInfo.labelFormat,
        idPlot: idPlot
    }).then(track => {
        callback(null, track.idTrack);
    }).catch(err => {
        callback(err, null);
    }));
}
let createDepthAxis = function (depth_axisInfo, dbConnection) {
    let DepthAxis = dbConnection.DepthAxis;
    let idDepthAxis = 0;
    await(DepthAxis.create(depth_axisInfo).then(depth_axis => {
        idDepthAxis = depth_axis.idDepthAxis;
    }).catch(err => {
        console.log(err);
    }));
    return idDepthAxis;
}
let createZoneTrack = function (zoneTrackInfo, dbConnection) {
    let ZoneTrack = dbConnection.ZoneTrack;
    let idZoneTrack = 0;
    await(ZoneTrack.create({
        showTitle: zoneTrackInfo.showTitle,
        title: zoneTrackInfo.title,
        topJustification: zoneTrackInfo.topJustification,
        bottomJustification: zoneTrackInfo.bottomJustification,
        orderNum: zoneTrackInfo.orderNum,
        color: zoneTrackInfo.color,
        width: zoneTrackInfo.width,
        idPlot: zoneTrackInfo.idPlot,
        idZoneSet: zoneTrackInfo.idZoneSet != 0 ? zoneTrackInfo.idZoneSet : null
    }).then(zoneTrack => {
        idZoneTrack = zoneTrack.idZoneTrack;
    }).catch(err => {
        console.log(err);
    }));
    return idZoneTrack;
}
let findZoneSet = function (zoneset, dbConnection, callback) {
    let ZoneSet = dbConnection.ZoneSet;
    let idZoneSet = 0;
    //console.log("WANT FIND : ", zoneset);
    ZoneSet.findAll({
        where: {
            name: zoneset.name,
            idWell: zoneset.idWell
        }
    }).then(zoneSet => {
        if (zoneSet.length > 0) {
            idZoneSet = zoneSet[0].idZoneSet;
        }
        callback(false, idZoneSet);
    }).catch(err => {
            callback(err, 0);
        }
    );
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
let createLine = function (line, dbConnection) {
    let Line = dbConnection.Line;
    let idLine = null;
    await(Line.create({
        showHeader: line.showHeader,
        showDataset: line.showDataset,
        minValue: line.minValue,
        maxValue: line.maxValue,
        autoValueScale: line.autoValueScale,
        displayMode: line.displayMode,
        wrapMode: line.wrapMode,
        blockPosition: line.blockPosition,
        ignoreMissingValues: line.ignoreMissingValues,
        displayType: line.displayType,
        displayAs: line.displayAs,
        lineStyle: line.lineStyle,
        lineWidth: line.lineWidth,
        lineColor: line.lineColor,
        symbolName: line.symbolName,
        symbolSize: line.symbolSize,
        symbolLineWidth: line.symbolLineWidth,
        symbolStrokeStyle: line.symbolStrokeStyle,
        symbolFillStyle: line.symbolFillStyle,
        symbolLineDash: line.symbolLineDash,
        alias: line.alias,
        idTrack: line.idTrack,
        idCurve: line.idCurve
    }).then(line => {
        idLine = line.idLine;
    }));
    return idLine;
}

let findLine = function (lineInfo, dbConnection, callback) {
    // console.log(lineInfo);
    let Line = dbConnection.Line;
    Line.findOne({
        where: {
            alias: lineInfo.alias,
            idTrack: lineInfo.idTrack
        }
    }).then(line => {
        if (line) {
            callback(null, line.idLine);
        } else {
            console.log("FOUND NO LINE");
            callback(null, null);
        }
    }).catch(err => {
        callback(err, null);
    })
}

let importPlotTemplate = function (req, done, dbConnection) {
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType != 'plot') {
        fs.unlink(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .plot files allowed!"));
    }
    let isCurveNotFound = false;
    let curveHasError = new Array();
    fs.readFile(filePath, 'utf8', async(function (err, data) {
        if (err) console.log(err);
        let myPlot = JSON.parse(data);
        let plot = new Object();
        plot.name = req.body.plotName ? req.body.plotName : myPlot.name;
        plot.option = myPlot.option;
        plot.idWell = req.body.idWell;
        let idPlot = createPlot(plot, dbConnection);
        if (idPlot == null) {
            fs.unlink(filePath);
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
        }
        plot.referenceCurve = new Object();
        plot.referenceCurve.idPlot = idPlot;
        plot.referenceCurve.idWell = req.body.idWell;
        if (myPlot.curve) {
            plot.referenceCurve.name = myPlot.curve.name;
            plot.referenceCurve.datasetName = myPlot.curve.datasetName;
        }
        findRefCurve(plot.referenceCurve, dbConnection);
        asyncLoop(myPlot.tracks, async(function (track, next) {
            createTrack(track, idPlot, dbConnection, function (err, result) {
                if (track.lines.length > 0) {
                    let response = [];
                    asyncLoop(track.lines, function (line, next) {
                        let curve = new Object();
                        curve.name = line.curve.name;
                        curve.datasetName = line.curve.datasetName;
                        curve.idWell = req.body.idWell;
                        findCurve(curve, dbConnection, async(function (err, idCurve) {
                            if (!err) {
                                line.idCurve = idCurve;
                                line.idTrack = result;
                                let idLine = createLine(line, dbConnection);
                                response.push(idLine);
                                next();
                            } else {
                                console.log("NO CURVE FOUND FOR DATASET : ", err);
                                curveHasError.push(err);
                                next(err);
                            }
                        }));
                    }, function (err) {
                        if (err) {
                            isCurveNotFound = true;
                        }
                        if (track.shadings.length > 0) {
                            asyncLoop(track.shadings, function (shading, next) {
                                shading.idTrack = result;
                                // console.log(shading);
                                findLine({
                                    idTrack: shading.idTrack,
                                    alias: shading.rightLine.alias
                                }, dbConnection, function (err, idLine) {
                                    shading.idRightLine = idLine;
                                    findLine({
                                        idTrack: shading.idTrack,
                                        alias: shading.leftLine.alias
                                    }, dbConnection, function (err, idLine) {
                                        shading.idLeftLine = idLine;
                                        delete shading.idControlCurve;
                                        delete shading.curve;
                                        delete shading.leftLine;
                                        delete shading.rightLine;
                                        let Shading = dbConnection.Shading;
                                        Shading.create(shading).then(s => {
                                        }).catch(err => {
                                            console.log(err);
                                        })
                                    })

                                });
                                next();
                            }, function (err) {
                                console.log("DONE SHADING");
                            });
                        } else {
                            console.log("NO SHADING");
                        }
                        if (track.markers.length > 0) {
                            asyncLoop(track.markers, function (marker, next) {
                                marker.idTrack = result;
                                dbConnection.Marker.create(marker).then(rs => {
                                    next();
                                }).catch(err => {
                                    next(err);
                                })
                            }, function (err) {
                                if (err) console.log("MARKER ERR : ", err);
                                console.log("DONE MARKER");
                            })
                        } else {
                            console.log("NO MARKERS");
                        }
                    });
                    next();
                } else {
                    next();
                }

            });
        }), function (err) {
            console.log("DONE TRACK");
            if (err) {
                console.log(err);
            }
            myPlot.depth_axes.forEachDone(async(function (depth_axis) {
                depth_axis.idPlot = idPlot;
                let idDepthAxis = createDepthAxis(depth_axis, dbConnection);
            }), function () {
                myPlot.zone_tracks.forEachDone(async(function (zone_track) {
                    zone_track.idPlot = idPlot;
                    let zoneset = new Object();
                    if (zone_track.idZoneSet != "NULL" && zone_track.idZoneSet != null) {
                        zoneset.name = zone_track.zoneset.name;
                        zoneset.idWell = req.body.idWell;
                        findZoneSet(zoneset, dbConnection, async(function (err, idZoneSet) {
                            zone_track.idZoneSet = idZoneSet;
                            let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                        }));
                    } else {
                        let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                    }

                }));
            });
            setTimeout(function () {
                if (!isCurveNotFound) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
                } else {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "CURVE_NOT_FOUND", curveHasError));
                }
            }, 1000)
            fs.unlink(filePath);
        });
    }));

};

module.exports = {
    duplicatePlot: duplicatePlot,
    createNewPlot: createNewPlot,
    editPlot: editPlot,
    deletePlot: deletePlot,
    getPlotInfo: getPlotInfo,
    exportData: exportData,
    importPlotTemplate: importPlotTemplate
};
