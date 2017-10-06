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

function createNewPlot(plotInfo, done, dbConnection) {
    var Plot = dbConnection.Plot;
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

function duplicatePlot(payload, done, dbConnection) {
    let response = [];

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
    // promiese.push(Cure.create().then());
    // promiese.push(Plot.create().then());
    // Promise.all().then();
    Plot.findById(payload.idPlot, {include: [{all: true, include: [{all: true}]}]}).then(rs => {
        let plot = rs.toJSON();
        delete plot.idPlot;
        if (plot.name.indexOf('_') != -1) {
            plot.name = plot.name.substring(0, plot.name.indexOf('_'));
        }
        plot.name = plot.name + "_" + Date.now();
        plot.idWell = payload.idWell;
        Plot.create(plot).then(rs => {
            console.log("CREATE PLOT");
            let tracks = plot.tracks.length != 0 ? plot.tracks : [];
            if (tracks.length != 0) {
                asyncLoop(tracks, (track, next) => {
                    delete track.idTrack;
                    track.idPlot = rs.idPlot;
                    Track.create(track).then(rs => {
                        console.log("CREATE TRACK");
                        let lines = track.lines.length != 0 ? track.lines : [];
                        if (lines.length != 0) {
                            asyncLoop(lines, (line, next) => {
                                let oldIdLine = line.idLine;
                                delete line.idLine;
                                line.idTrack = rs.idTrack;
                                Line.create(line).then(rs => {
                                    console.log("CREATE LINE");
                                    let shadings = track.shadings.length != 0 ? track.shadings : [];
                                    if (shadings.length != 0) {
                                        asyncLoop(shadings, function (shading, next) {
                                            delete shading.idShading;
                                            shading.idTrack = rs.idTrack;
                                            shading.idLeftLine = shading.idLeftLine == oldIdLine ? rs.idLine : null;
                                            shading.idRightLine = shading.idRightLine == oldIdLine ? rs.idLine : null;
                                            //shading.idControlCurve = ??? TODO
                                            Shading.create(shading).then(rs => {
                                                console.log("CREATE SHADING");
                                                next();
                                            }).catch(err => {
                                                next(err);
                                            });
                                        }, function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            console.log('CREATE SHADING Finished!');
                                        });
                                    }
                                    next();
                                }).catch(err => {
                                    next(err);
                                });
                            }, err => {
                                if (err) console.log("CREATE LINE ERR" + err);
                                console.log("CREATE LINE Finished");
                            });
                        }
                        let images = track.images.length != 0 ? track.images : [];
                        if (images.length != 0) {
                            asyncLoop(images, (image, next) => {
                                delete image.idImage;
                                image.idTrack = rs.idTrack;
                                Image.create(image).then(rs => {
                                    console.log("CREATE IMAGE");
                                    next();
                                }).catch(err => {
                                    next(err);
                                });
                            }, err => {
                                if (err) console.log("IMAGE ERR" + err);
                                console.log("CREATE IMAGE Finished");
                            });
                        }
                        let markers = track.markers.length != 0 ? track.markers : [];
                        if (markers.length != 0) {
                            asyncLoop(markers, (marker, next) => {
                                delete marker.idMarker;
                                marker.idTrack = rs.idTrack;
                                Marker.create(marker).then(rs => {
                                    console.log("CREATE MARKER");
                                    next();
                                }).catch(err => {
                                    next(err);
                                });
                            }, err => {
                                if (err) console.log("CREATE MARKER ERR" + err);
                                console.log("CREATE MARKER Finished");
                            });
                        }
                        let annotations = track.annotations.length != 0 ? track.annotations : [{}];
                        if (annotations.length != 0) {
                            asyncLoop(annotations, (annotation, next) => {
                                delete annotation.idAnnotation;
                                annotation.idTrack = rs.idTrack;
                                Annotation.create(annotation).then(rs => {
                                    console.log("CREATE ANNOTATION");
                                    next();
                                }).catch(err => {
                                    next(err);
                                });
                            }, err => {
                                if (err) console.log("CREATE ANNOTATION ERR" + err);
                                console.log("CREATE ANNOTATION Finished!");
                            });
                        }
                        next();
                    }).catch(err => {
                        console.log(err);
                        next(err);
                    });
                }, err => {
                    if (err) console.log("CREATE TRACK ERR" + err);
                    console.log("CREATE TRACK Finished");
                });
            }
            let depth_axes = plot.depth_axes.length != 0 ? plot.depth_axes : [];
            if (depth_axes.length != 0) {
                asyncLoop(depth_axes, (depth_axis, next) => {
                    delete depth_axis.idDepthAxis;
                    depth_axis.idPlot = rs.idPlot;
                    DepthAxis.create(depth_axis).then(rs => {
                        console.log("CREATE DEPTH AXIS");
                        next();
                    }).catch(err => {
                        next(err);
                    });
                }, err => {
                    if (err) console.log("CREATE DEPTH AXIS ERR" + err);
                    console.log("CREATE DEPTH EXIS Finished");
                });
            }
            let zone_tracks = plot.zone_tracks.length != 0 ? plot.zone_tracks : [];
            if (zone_tracks.length != 0) {
                asyncLoop(zone_tracks, (zone_track, next) => {
                    delete zone_track.idZoneTrack;
                    zone_track.idPlot = rs.idPlot;
                    ZoneTrack.create(zone_track).then(rs => {
                        console.log("CREATE ZONE TRACK");
                        next();
                    }).catch(err => {
                        next(err);
                    });
                }, err => {
                    if (err) console.log("CREATE ZONE TRACK ERR" + err);
                    console.log("CREATE ZONE TRACK Finished");
                })
            }
            done(ResponseJSON(ErrorCodes.SUCCESS, "Duplicate Plot success"));
        }).catch(err => {
            console.log("LOI NA");
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Duplicate Plot Failed", err.message));
        });
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Error"));
    });
};
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
        myPlot.curve.datasetName = getDatasetName(myPlot.curve.idDataset, dbConnection);
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
                shading.leftLine.alias = getLine(shading.idLeftLine, dbConnection).alias;
                shading.rightLine.alias = getLine(shading.idRightLine, dbConnection).alias;
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
            delete zone_track.zoneset.idZoneSet;
            delete zone_track.zoneset.createdAt;
            delete zone_track.zoneset.updatedAt;
            zone_track.zoneset.zones.forEach(function (zone) {
                delete zone.idZone;
                delete zone.createdAt;
                delete zone.updatedAt;
            });
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
        console.log("CREATED PLOT");
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
                    if (c) {
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

let createTrack = function (trackInfo, idPlot, dbConnection) {
    let Track = dbConnection.Track;
    let idTrack = 0;
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
        console.log("CREATED TRACK");
        idTrack = track.idTrack;
    }).catch(err => {
        console.log(err);
    }));
    return idTrack;
}
let createDepthAxis = function (depth_axisInfo, dbConnection) {
    let DepthAxis = dbConnection.DepthAxis;
    let idDepthAxis = 0;
    await(DepthAxis.create(depth_axisInfo).then(depth_axis => {
        console.log("CREATED DEPTH AXIS");
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
        console.log("CREATE ZONE TRACK");
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
        console.log("Found Zone Set");
        if (zoneSet.length > 0) {
            idZoneSet = zoneSet[0].idZoneSet;
        }
        callback(false, idZoneSet);
    }).catch(err => {
            callback(err, 0);
        }
    );
}
let findCurve = function (curve, dbConnection, callback) {
    let Curve = dbConnection.Curve;
    let Dataset = dbConnection.Dataset;
    let idCurve = null;
    Dataset.findOne({
        where: {
            idWell: curve.idWell,
            name: curve.datasetName
        }
    }).then(dataset => {
        if (dataset) {
            Curve.findOne({
                where: {
                    idDataset: dataset.idDataset,
                    name: curve.name
                }
            }).then(curve => {
                if (curve) {
                    idCurve = curve.idCurve;
                    callback(null, idCurve);
                } else {
                    console.log("NO CURVE");
                    callback(null, null);
                }
            });
        } else {
            console.log("NO DATASET");
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
let createMarker = function (markerInfo, dbConnection) {
    let Marker = dbConnection.Marker;
    let idMarker = null;
    await(Marker.create(markerInfo).then(marker => {
        console.log("CREATED MARKER");
        idMarker = marker.idMarker;
    }).catch(err => {
        console.log(err);
    }));
    return idMarker;
}
let findLine_ = function (lineInfo, dbConnection, callback) {
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
            callback(null, null);
        }
    }).catch(err => {
        console.log(err);
        callback(null, null);
    })
}
let findLine = function (lineInfo, dbConnection) {
    return new Promise(function (resolve, reject) {
        let Line = dbConnection.Line;
        Line.findOne({
            where: {
                alias: lineInfo.alias,
                idTrack: lineInfo.idTrack
            }
        }).then(line => {
            if (line) {
                resolve(line.idLine);
            } else {
                reject(null);
            }
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    })
}
let createShading = function (shadingInfo, dbConnection) {
    let Shading = dbConnection.Shading;
    let idShading = null;
    if (shadingInfo.idLeftLine == null) delete shadingInfo.idLeftLine;
    if (shadingInfo.idRightLine == null) delete shadingInfo.idRightLine;
    // if (shadingInfo.idControlCurve == null) delete shadingInfo.idControlCurve;
    await(Shading.create(shadingInfo).then(shading => {
        idShading = shading.idShading;
    }).catch(err => {
        console.log(err);
    }));
    return idShading;
}

let importPlotTemplate = function (req, done, dbConnection) {
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType != 'plot') {
        fs.unlink(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .plot files allowed!"));
    }
    fs.readFile(filePath, 'utf8', async(function (err, data) {
        if (err) console.log(err);
        let myPlot = JSON.parse(data);
        // await(myTestFunc());
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
        plot.referenceCurve.name = myPlot.curve.name;
        plot.referenceCurve.datasetName = myPlot.curve.datasetName;
        findRefCurve(plot.referenceCurve, dbConnection);
        myPlot.tracks.forEachDone(function (track) {
            let idTrack = createTrack(track, idPlot, dbConnection);
            track.lines.forEach(async(function (line) {
                let curve = new Object();
                if (line.idCurve != "NULL") {
                    curve.name = line.curve.name;
                    curve.datasetName = line.curve.datasetName;
                    curve.idWell = req.body.idWell;
                    findCurve(curve, dbConnection, async(function (err, idCurve) {
                        line.idCurve = idCurve;
                        line.idTrack = idTrack;
                        let idLine = createLine(line, dbConnection);
                    }));
                }
            }));
            setTimeout(function () {
                track.shadings.forEach(async(function (shading) {
                    shading.idTrack = idTrack;
                    await(findLine({
                        alias: shading.leftLine.alias,
                        idTrack: idTrack
                    }, dbConnection).then(rs => {
                        shading.idLeftLine = rs;
                    }));
                    await(findLine({
                        alias: shading.rightLine.alias,
                        idTrack: idTrack
                    }, dbConnection).then(rs => {
                        shading.idRightLine = rs;
                    }));
                    delete shading.idControlCurve;
                    delete shading.curve;
                    delete shading.leftLine;
                    delete shading.rightLine;
                    let idShading = createShading(shading, dbConnection);
                    // console.log(idShading);
                }));
            }, 2000);


            track.markers.forEach(async(function (marker) {
                marker.idTrack = idTrack;
                let idMarker = createMarker(marker, dbConnection);
                // console.log(idMarker);
            }));
        }, function () {
            myPlot.depth_axes.forEachDone(async(function (depth_axis) {
                depth_axis.idPlot = idPlot;
                let idDepthAxis = createDepthAxis(depth_axis, dbConnection);
                // console.log(idDepthAxis);
            }), function () {
                myPlot.zone_tracks.forEachDone(async(function (zone_track) {
                    zone_track.idPlot = idPlot;
                    let zoneset = new Object();
                    if (zone_track.idZoneSet != "NULL" && zone_track.idZoneSet != 0) {
                        zoneset.name = zone_track.zoneset.name;
                        zoneset.idWell = req.body.idWell;
                        findZoneSet(zoneset, dbConnection, async(function (err, idZoneSet) {
                            zone_track.idZoneSet = idZoneSet;
                            let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                            // console.log("ID ZONE SET ", zone_track.idZoneSet);
                            // console.log(idZoneTrack);
                        }));
                    } else {
                        let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                        // console.log(idZoneTrack);
                    }

                }));
            });
        });
        setTimeout(function () {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
        }, 1000)
        await(fs.unlink(filePath));
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
