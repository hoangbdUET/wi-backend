// var models = require('../models');
// var Plot = models.Plot;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var async = require('async');
// const async = require('promise-async')
var asyncLoop = require('async/each');
var exporter = require('./exporter');
var fs = require('fs');
var path = require('path');
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

function searchReferenceCurve(idWell, dbConnection, callback) {
    let FamilyModel = dbConnection.Family;
    let CurveModel = dbConnection.Curve;
    let DatasetModel = dbConnection.Dataset;
    FamilyModel.findOne({
        where: {
            name: "Gamma Ray"
        }
    }).then(family => {
        if (family) {
            DatasetModel.findAll({where: {idWell: idWell}}).then((datasets) => {
                if (datasets.length == 0) {
                    callback("No dataset", false);
                } else {
                    asyncLoop(datasets, function (dataset, next) {
                        let Sequelize = require('sequelize');
                        console.log("Dataset : ", dataset.idDataset, " Family : ", family.idFamily);
                        CurveModel.findOne({
                            // where: Sequelize.and(
                            //     {idFamily: family.idFamily},
                            //     {idDataset: dataset.idDataset}
                            // )
                            where: {
                                idFamily: family.idFamily,
                                idDataset: dataset.idDataset
                            }
                        }).then(curve => {
                            if (curve) {
                                console.log("FOUND CURVE");
                                next(curve.idCurve);
                                // callback(false, curve.idCurve);
                            } else {
                                console.log("NOT CURVE");
                                CurveModel.findOne({where: {idDataset: dataset.idDataset}}).then(c => {
                                    if (c) {
                                        next(c.idCurve);
                                        // callback(false, c.idCurve);
                                    } else {
                                        next();
                                        //callback("No curve", null);
                                    }
                                }).catch(err => {
                                    callback(err, null);
                                });
                            }
                        });
                    }, function (idCurve) {
                        if (idCurve) {
                            return callback(false, idCurve);
                        } else {
                            callback("No Curve", null);
                        }
                    });
                }
            })
        } else {
            callback("No family", null);
        }
    }).catch(err => {
        callback(err, null);
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
                                    dbConnection.Dataset.findAll({where: {idWell: myPlot.idWell}}).then(datasets => {
                                        asyncLoop(datasets, function (dataset, nextDataset) {
                                            dbConnection.Curve.findOne({
                                                where: {
                                                    idFamily: idFamily,
                                                    idDataset: dataset.idDataset
                                                }
                                            }).then(curve => {
                                                if (curve) {
                                                    // console.log("FOUND CURVE : NEXT ", curve.name);
                                                    lineModel.createNewLineWithoutResponse({
                                                        idCurve: curve.idCurve,
                                                        idTrack: idTrack
                                                    }, dbConnection, username, function (line) {
                                                        nextDataset();
                                                    });
                                                    // dbConnection.Dataset.findById(curve.idDataset).then(dataset => {
                                                    //     if (dataset.idWell == myPlot.idWell) {
                                                    //         lineModel.createNewLineWithoutResponse({
                                                    //             idCurve: curve.idCurve,
                                                    //             idTrack: idTrack
                                                    //         }, dbConnection, username, function (line) {
                                                    //             next();
                                                    //         });
                                                    //     } else {
                                                    //         familyWithErr.push(family.name);
                                                    //         next();
                                                    //     }
                                                    // });
                                                } else {
                                                    // console.log("NOT FOUND CURVE NEXT");
                                                    familyWithErr.push(family.name);
                                                    nextDataset();
                                                }
                                            });
                                        }, function () {
                                            next();
                                        });
                                    });
                                } else {
                                    next();
                                }
                            });
                        }, function (curve) {
                            next();
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
                let rs = plot.toJSON();
                rs.familiesWithoutCurve = familyWithErr;
                callback(null, rs);
            });
        });
    }).catch(err => {
        console.log(err.message);
        callback(err, null);
    });
}

function createNewPlot(plotInfo, done, dbConnection, username) {
    let Plot = dbConnection.Plot;
    searchReferenceCurve(plotInfo.idWell, dbConnection, function (err, idRefCurve) {
        if (err) {
            console.log(err);
            delete plotInfo.referenceCurve;
            if (plotInfo.plotTemplate) {
                let myPlot = null;
                try {
                    myPlot = require('./plot-template/' + plotInfo.plotTemplate + '.json');
                } catch (err) {
                    return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot type not existed!", "PLOT TYPE TEMPLATE NOT FOUND"));
                }
                myPlot.referenceCurve = plotInfo.referenceCurve;
                myPlot.idWell = plotInfo.idWell;
                myPlot.name = plotInfo.name ? plotInfo.name : myPlot.name;
                createPlotTemplate(myPlot, dbConnection, function (err, result) {
                    if (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed", "PLOT NAME EXISTED"));
                    } else {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create " + plotInfo.plotTemplate + " successful", result));
                    }
                }, username);
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
        } else {
            plotInfo.referenceCurve = idRefCurve;
            if (plotInfo.plotTemplate) {
                let myPlot = null;
                try {
                    myPlot = require('./plot-template/' + plotInfo.plotTemplate + '.json');
                } catch (err) {
                    return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot type not existed!", "PLOT TYPE TEMPLATE NOT FOUND"));
                }
                myPlot.referenceCurve = plotInfo.referenceCurve;
                myPlot.idWell = plotInfo.idWell;
                myPlot.name = plotInfo.name ? plotInfo.name : myPlot.name;
                createPlotTemplate(myPlot, dbConnection, function (err, result) {
                    if (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed", "PLOT NAME EXISTED"));
                    } else {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create " + plotInfo.plotTemplate + " successful", result));
                    }
                }, username);
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
    });
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
        plot.name = plot.name + "_" + new Date().toLocaleString('en-US', {timeZone: "Asia/Ho_Chi_Minh"});
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

let getDatasetName = function (idDataset, dbConnection) {
    let Dataset = dbConnection.Dataset;
    return new Promise(function (resole, reject) {
        Dataset.findById(idDataset).then(dataset => {
            resole(dataset.name);
        }).catch(err => {
            console.log(err);
            resole("");
        });
    });
};
let getLine = function (idLine, dbConnection) {
    let Line = dbConnection.Line;
    return new Promise(function (resole, reject) {
        Line.findById(idLine).then(line => {
            if (line) {
                resole(line);
            } else {
                resole(null);
            }
        }).catch(err => {
            console.log(err);
            resole(null);
        });
    });
}
let exportData = function (payload, done, error, dbConnection, username) {
    let Plot = dbConnection.Plot;
    Plot.findById(payload.idPlot, {
        include: [{
            all: true,
            include: [{all: true, include: [{all: true}]}]
        }]
    }).then(async rs => {
        let myPlot = rs.toJSON();
        delete myPlot.createdAt;
        delete myPlot.updatedAt;
        delete myPlot.idPlot;
        if (myPlot.curve) {
            myPlot.curve.datasetName = await getDatasetName(myPlot.curve.idDataset, dbConnection);
        }
        await myPlot.tracks.forEach(async function (track) {
            delete track.idTrack;
            delete track.createdAt;
            delete track.updatedAt;
            await track.lines.forEach(async function (line) {
                delete line.idLine;
                delete line.updatedAt;
                delete line.createdAt;
                line.curve.datasetName = await getDatasetName(line.curve.idDataset, dbConnection);
            });
            await track.shadings.forEach(async function (shading) {
                delete shading.idShading;
                delete shading.createdAt;
                delete shading.updatedAt;
                delete shading.line;
                shading.leftLine = new Object();
                shading.rightLine = new Object();
                if (shading.idLeftLine != null) {
                    shading.leftLine = await getLine(shading.idLeftLine, dbConnection);
                }
                if (shading.idRightLine != null) {
                    shading.rightLine = await getLine(shading.idRightLine, dbConnection);
                }
            });
            await track.images.forEach(function (image) {
                delete image.idImage;
                delete image.createdAt;
                delete image.updatedAt;
            });
            await track.markers.forEach(function (marker) {
                delete marker.idMarker;
                delete marker.createdAt;
                delete marker.updatedAt;
            });
            await track.annotations.forEach(function (annotation) {
                delete annotation.idAnnotation;
                delete annotation.createdAt;
                delete annotation.updatedAt;
            });
        });
        await myPlot.depth_axes.forEach(function (depth_axis) {
            delete depth_axis.createdAt;
            delete depth_axis.updatedAt;
            delete depth_axis.idDepthAxis;
        });
        await myPlot.zone_tracks.forEach(function (zone_track) {
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
        await setTimeout(function () {
            exporter.exportData(myPlot, done);
        }, 2000);
    }).catch(err => {
        console.log(err);
    });
};

let createPlot = function (plot, dbConnection) {
    return new Promise(function (resole, reject) {
        let Plot = dbConnection.Plot;
        Plot.create(plot).then(rs => {
            resole(rs.idPlot);
        }).catch(err => {
            console.log(err.message);
            resole(null);
        });
    });
};
let findRefCurve = function (curve, dbConnection) {
    return new Promise(function (resole, reject) {
        let Curve = dbConnection.Curve;
        let Dataset = dbConnection.Dataset;
        let Well = dbConnection.Well;
        let Plot = dbConnection.Plot;
        let idReferenceCurve = 0;
        Well.findById(curve.idWell).then(well => {
            Dataset.findAll({
                where: {
                    name: curve.datasetName,
                    idWell: well.idWell
                }
            }).then(dataset => {
                if (dataset.length > 0) {
                    //console.log("CURVE : " , curve);
                    Curve.findAll({
                        where: {
                            name: curve.name,
                            idDataset: dataset[0].idDataset
                        }
                    }).then(c => {
                        if (c.length > 0) {
                            // console.log("CURVE  : ", c[0]);
                            Plot.findById(curve.idPlot).then(plot => {
                                plot.referenceCurve = c[0].idCurve;
                                plot.save().then(rs => {
                                    //console.log("UPDATE REFERENCE CURVE");
                                    idReferenceCurve = c[0].idCurve;
                                    resole(idReferenceCurve);
                                }).catch(err => {
                                    console.log(err);
                                });
                            });
                        } else {
                            resole(idReferenceCurve);
                            console.log("NO CURVE");
                        }
                    }).catch(err => {
                        console.log(err);
                        reject(err);
                    });
                } else {
                    resole(idReferenceCurve);
                    console.log("NO DATASET");
                }
            }).catch(err => {
                reject(err);
                console.log(err);
            });
        }).catch(err => {
            console.log(err)
        });
    });
}

let createTrack = function (trackInfo, idPlot, dbConnection, callback) {
    let Track = dbConnection.Track;
    Track.create({
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
    });
}
let createDepthAxis = function (depth_axisInfo, dbConnection) {
    let DepthAxis = dbConnection.DepthAxis;
    let idDepthAxis = 0;
    return new Promise(function (resole, reject) {
        DepthAxis.create(depth_axisInfo).then(depth_axis => {
            idDepthAxis = depth_axis.idDepthAxis;
            resole(idDepthAxis);
        }).catch(err => {
            console.log(err);
            resole(idDepthAxis);
        });
    });

}
let createZoneTrack = function (zoneTrackInfo, dbConnection) {
    let ZoneTrack = dbConnection.ZoneTrack;
    let idZoneTrack = 0;
    return new Promise(function (resole, reject) {
        ZoneTrack.create({
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
            resole(idZoneTrack);
        }).catch(err => {
            console.log(err);
            resole(idZoneTrack);
        });
    })
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
    return new Promise(function (resole, reject) {
        Line.create({
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
            resole(idLine);
        }).catch(err => {
            resole(idLine);
        });
    })
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
        fs.unlinkSync(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .plot files allowed!"));
    }
    let isCurveNotFound = false;
    let curveHasError = new Array();
    fs.readFile(filePath, 'utf8', async function (err, data) {
        if (err) console.log(err);
        let myPlot = JSON.parse(data);
        let plot = new Object();
        plot.name = req.body.plotName ? req.body.plotName : myPlot.name;
        plot.option = myPlot.option;
        plot.idWell = req.body.idWell;
        let idPlot = await createPlot(plot, dbConnection);
        if (idPlot == null) {
            fs.unlinkSync(filePath);
            return await done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
        }
        plot.referenceCurve = new Object();
        plot.referenceCurve.idPlot = idPlot;
        plot.referenceCurve.idWell = req.body.idWell;
        if (myPlot.curve) {
            plot.referenceCurve.name = myPlot.curve.name;
            plot.referenceCurve.datasetName = myPlot.curve.datasetName;
        }
        let idRef = await findRefCurve(plot.referenceCurve, dbConnection);
        asyncLoop(myPlot.tracks, function (track, next) {
            createTrack(track, idPlot, dbConnection, function (err, result) {
                console.log("Done track ", result);
                if (track.lines.length > 0) {
                    asyncLoop(track.lines, function (line, next) {
                        let curve = new Object();
                        curve.name = line.curve.name;
                        curve.datasetName = line.curve.datasetName;
                        curve.idWell = req.body.idWell;
                        findCurve(curve, dbConnection, async function (err, idCurve) {
                            if (!err) {
                                line.idCurve = idCurve;
                                line.idTrack = result;
                                let idLine = await createLine(line, dbConnection);
                                await next();
                            } else {
                                console.log("NO CURVE FOUND FOR DATASET : ", err);
                                curveHasError.push(err);
                                next(err);
                            }
                        });
                    }, function (err) {
                        //done all lines
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
                                console.log("DONE SHADINGS");
                            });
                        } else {
                            console.log("NO SHADINGS");
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
                        next();
                    });
                } else {
                    next();
                }
            });
        }, function (err) {
            //done all track
            console.log("DONE TRACK");
            if (err) {
                console.log(err);
            }
            myPlot.depth_axes.forEachDone(async function (depth_axis) {
                depth_axis.idPlot = idPlot;
                let idDepthAxis = await createDepthAxis(depth_axis, dbConnection);
            }), function () {
                myPlot.zone_tracks.forEachDone(function (zone_track) {
                    zone_track.idPlot = idPlot;
                    let zoneset = new Object();
                    if (zone_track.idZoneSet != "NULL" && zone_track.idZoneSet != null) {
                        zoneset.name = zone_track.zoneset.name;
                        zoneset.idWell = req.body.idWell;
                        findZoneSet(zoneset, dbConnection, function (err, idZoneSet) {
                            zone_track.idZoneSet = idZoneSet;
                            let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                        });
                    } else {
                        let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                    }

                });
            };
            setTimeout(function () {
                if (!isCurveNotFound) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", {idPlot: idPlot}));
                } else {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "CURVE_NOT_FOUND", curveHasError));
                }
            }, 1000)
            fs.unlinkSync(filePath);
        });
    });
}
let importPlotTemplate_ = function (req, done, dbConnection) {
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType != 'plot') {
        fs.unlink(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .plot files allowed!"));
    }
    let isCurveNotFound = false;
    let curveHasError = new Array();
    fs.readFile(filePath, 'utf8', async function (err, data) {
        if (err) console.log(err);
        let myPlot = JSON.parse(data);
        let plot = new Object();
        plot.name = req.body.plotName ? req.body.plotName : myPlot.name;
        plot.option = myPlot.option;
        plot.idWell = req.body.idWell;
        if (idPlot == null) {
            fs.unlink(filePath);
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
        }
        let idPlot = await createPlot(plot, dbConnection);
        plot.referenceCurve = new Object();
        plot.referenceCurve.idPlot = idPlot;
        plot.referenceCurve.idWell = req.body.idWell;
        if (myPlot.curve) {
            plot.referenceCurve.name = myPlot.curve.name;
            plot.referenceCurve.datasetName = myPlot.curve.datasetName;
        }
        let idRef = await findRefCurve(plot.referenceCurve, dbConnection);
        // console.log("=========", idRef);
        asyncLoop(myPlot.tracks, function (track, next) {
            createTrack(track, idPlot, dbConnection, function (err, result) {
                if (track.lines.length > 0) {
                    let response = [];
                    asyncLoop(track.lines, async function (line, next) {
                        let curve = new Object();
                        curve.name = line.curve.name;
                        curve.datasetName = line.curve.datasetName;
                        curve.idWell = req.body.idWell;
                        findCurve(curve, dbConnection, async function (err, idCurve) {
                            if (!err) {
                                line.idCurve = idCurve;
                                line.idTrack = result;
                                let idLine = await createLine(line, dbConnection);
                                response.push(idLine);
                                next();
                            } else {
                                console.log("NO CURVE FOUND FOR DATASET : ", err);
                                curveHasError.push(err);
                                next(err);
                            }
                        });
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
        }, function (err) {
            console.log("DONE TRACK");
            if (err) {
                console.log(err);
            }
            myPlot.depth_axes.forEachDone(async function (depth_axis) {
                depth_axis.idPlot = idPlot;
                let idDepthAxis = await createDepthAxis(depth_axis, dbConnection);
            }), function () {
                myPlot.zone_tracks.forEachDone(function (zone_track) {
                    zone_track.idPlot = idPlot;
                    let zoneset = new Object();
                    if (zone_track.idZoneSet != "NULL" && zone_track.idZoneSet != null) {
                        zoneset.name = zone_track.zoneset.name;
                        zoneset.idWell = req.body.idWell;
                        findZoneSet(zoneset, dbConnection, function (err, idZoneSet) {
                            zone_track.idZoneSet = idZoneSet;
                            let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                        });
                    } else {
                        let idZoneTrack = createZoneTrack(zone_track, dbConnection);
                    }

                });
            };
            setTimeout(function () {
                if (!isCurveNotFound) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
                } else {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "CURVE_NOT_FOUND", curveHasError));
                }
            }, 1000)
            fs.unlink(filePath);
        });
    });

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