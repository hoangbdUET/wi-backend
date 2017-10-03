// var models = require('../models');
// var Plot = models.Plot;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
//var async = require('async');
// const async = require('promise-async')
var EventEmitter = require('events');
var asyncLoop = require('node-async-loop');

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
    let event = new EventEmitter.EventEmitter();
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
        plot.name = "dup_" + plot.name;
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
                        let images = track.images.length != 0 ? tracks.images : [];
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
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Error"));
    });
};

module.exports = {
    duplicatePlot: duplicatePlot,
    createNewPlot: createNewPlot,
    editPlot: editPlot,
    deletePlot: deletePlot,
    getPlotInfo: getPlotInfo
};
