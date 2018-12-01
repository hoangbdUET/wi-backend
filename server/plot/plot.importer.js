const path = require('path');
const fs = require('fs');
const async = require('async');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let createdBy;
let updatedBy;

function findCurve(curve, dbConnection, idProject) {
    return new Promise((resolve => {
        if (!curve) return resolve(null);
        dbConnection.Well.findOne({where: {name: curve.well, idProject: idProject}}).then(w => {
            if (!w) resolve(null);
            dbConnection.Dataset.findOne({where: {name: curve.dataset, idWell: w.idWell}}).then(d => {
                if (!d) resolve(null);
                dbConnection.Curve.findOne({where: {name: curve.curve, idDataset: d.idDataset}}).then(c => {
                    if (!c) {
                        resolve(null);
                    } else {
                        resolve(c);
                    }
                });
            });
        }).catch(err => {
            resolve(null);
        });
    }));
}

function findWell(well, dbConnection, idProject) {
    return new Promise((resolve => {
        if (!well) return resolve(null);
        dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
            if (!w) {
                resolve(null);
            } else {
                resolve(w);
            }
        }).catch(err => {
            resolve(null);
        });
    }));
}

function findZoneSet(zoneSet, dbConnection, idProject) {
    return new Promise((resolve => {
        if (!zoneSet) return resolve(null);
        dbConnection.Well.findOne({where: {name: zoneSet.well, idProject: idProject}}).then(w => {
            if (!w) {
                resolve(null);
            } else {
                dbConnection.ZoneSet.findOne({where: {idWell: w.idWell, name: zoneSet.name}}).then(zs => {
                    if (!zs) {
                        resolve(null);
                    } else {
                        resolve(zs);
                    }
                });
            }
        }).catch(err => {
            resolve(null);
        })
    }));
}

function findMarkerSet(markerSet, dbConnection, idProject) {
    return new Promise((resolve => {
        if (!markerSet) return resolve(null);
        dbConnection.Well.findOne({where: {name: markerSet.well, idProject: idProject}}).then(w => {
            if (!w) {
                resolve(null);
            } else {
                dbConnection.MarkerSet.findOne({where: {idWell: w.idWell, name: markerSet.name}}).then(zs => {
                    if (!zs) {
                        resolve(null);
                    } else {
                        resolve(zs);
                    }
                });
            }
        }).catch(err => {
            resolve(null);
        })
    }));
}

function findLine(line, dbConnection, idTrack) {
    return new Promise((resolve => {
        if (!line) return resolve(null);
        dbConnection.Line.findOne({where: {alias: line.alias, idTrack: idTrack}}).then(l => {
            if (!l) {
                resolve(null);
            } else {
                resolve(l);
            }
        })
    }));
}

function createPlot(plot, dbConnection, idProject) {
    plot.createdBy = createdBy;
    plot.updatedBy = updatedBy;
    plot.idProject = idProject;
    return dbConnection.Plot.create(plot);
}

async function createDepthAxis(depth_axis, dbConnection, idProject, idPlot) {
    depth_axis.idPlot = idPlot;
    depth_axis.createdBy = createdBy;
    depth_axis.updatedBy = updatedBy;
    let well = await findWell(depth_axis.well, dbConnection, idProject);
    let curve = await findCurve(depth_axis.curve, dbConnection, idProject);
    depth_axis.idWell = well ? well.idWell : null;
    depth_axis.idCurve = curve ? curve.idCurve : null;
    return dbConnection.DepthAxis.create(depth_axis);
}

async function createZoneTrack(zone_track, dbConnection, idProject, idPlot) {
    zone_track.idPlot = idPlot;
    zone_track.createdBy = createdBy;
    zone_track.updatedBy = updatedBy;
    let zone_set = await findZoneSet(zone_track.zone_set, dbConnection, idProject);
    zone_track.idZoneSet = zone_set ? zone_set.idZoneSet : null;
    return dbConnection.ZoneTrack.create(zone_track);
}

function createImageTrack(image_track, dbConnection, idProject, idPlot) {
    return new Promise(resolve => {
        image_track.idPlot = idPlot;
        image_track.createdBy = createdBy;
        image_track.updatedBy = updatedBy;
        dbConnection.ImageTrack.create(image_track).then(imt => {
            async.each(image_track.image_of_tracks, (image, nextImg) => {
                image.idImageTrack = imt.idImageTrack;
                image.createdBy = createdBy;
                image.updatedBy = updatedBy;
                dbConnection.ImageOfTrack.create(image).then(() => {
                    nextImg();
                }).catch(err => {
                    console.log(err);
                    nextImg();
                });
            }, () => {
                resolve();
            });
        });
    })
}

function createTrack(track, dbConnection, idProject, idPlot, username) {
    return new Promise(async resolve => {
        track.idPlot = idPlot;
        track.createdBy = createdBy;
        track.updatedBy = updatedBy;
        let zone_set = await findZoneSet(track.zone_set, dbConnection, idProject);
        let marker_set = await findMarkerSet(track.marker_set, dbConnection, idProject);
        track.idZoneSet = zone_set ? zone_set.idZoneSet : null;
        track.idMarkerSet = marker_set ? marker_set.idMarkerSet : null;
        dbConnection.Track.create(track).then(_track => {
            async.series([
                function (cb) {
                    async.each(track.annotations, (annotation, next) => {
                        annotation.idTrack = _track.idTrack;
                        annotation.createdBy = createdBy;
                        annotation.updatedBy = updatedBy;
                        dbConnection.Annotation.create(annotation).then(() => {
                            next();
                        })
                    }, cb);
                },
                function (cb) {
                    async.each(track.lines, (line, next) => {
                        line.idTrack = _track.idTrack;
                        line.createdBy = _track.createdBy;
                        line.updatedBy = _track.updatedBy;
                        findCurve(line.curve, dbConnection, idProject).then(curve => {
                            if (!curve) {
                                resolve();
                            } else {
                                line.idCurve = curve.idCurve;
                                let lineModel = require('../line/line.model');
                                lineModel.createNewLineWithoutResponse(line, dbConnection, username).then(() => {
                                    next();
                                });
                            }
                        })
                    }, cb)
                },
                function (cb) {
                    async.each(track.shadings, (shading, next) => {
                        shading.idTrack = _track.idTrack;
                        shading.createdBy = createdBy;
                        shading.updatedBy = updatedBy;
                        findCurve(shading.controle_curve, dbConnection, idProject).then(async crtlCurve => {
                            shading.idControlCurve = crtlCurve ? crtlCurve.idCurve : null;
                            let left_line = await findLine(shading.left_line, dbConnection, _track.idTrack);
                            let right_line = await findLine(shading.right_line, dbConnection, _track.idTrack);
                            shading.idLeftLine = left_line ? left_line.idLine : null;
                            shading.idRightLine = right_line ? right_line.idLine : null;
                            dbConnection.Shading.create(shading).then(() => {
                                next();
                            }).catch(err => {
                                console.log(err);
                                next();
                            });
                        });
                    }, cb);
                }
            ], () => {
                resolve();
            })
        }).catch(err => {
            console.log(err);
            resolve();
        });
    });
}

module.exports = function (req, done, dbConnection, username) {
    createdBy = req.createdBy;
    updatedBy = req.updatedBy;
    let idProject = req.body.idProject;
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
        myPlot.name = req.body.plotName;
        createPlot(myPlot, dbConnection, idProject).then(pl => {
            async.series([
                function (cb) {
                    async.each(myPlot.tracks, (track, nextTrack) => {
                        createTrack(track, dbConnection, idProject, pl.idPlot, username).then(() => {
                            nextTrack();
                        });
                    }, cb);
                },
                function (cb) {
                    async.each(myPlot.depth_axes, (depth_axis, nextDepth) => {
                        createDepthAxis(depth_axis, dbConnection, idProject, pl.idPlot).then(() => {
                            nextDepth();
                        });
                    }, cb());
                },
                function (cb) {
                    async.each(myPlot.zone_tracks, (zone_track, nextZoneTrack) => {
                        createZoneTrack(zone_track, dbConnection, idProject, pl.idPlot).then(() => {
                            nextZoneTrack();
                        });
                    }, cb)
                },
                function (cb) {
                    async.each(myPlot.image_tracks, (image_track, nextImageTrack) => {
                        createImageTrack(image_track, dbConnection, idProject, pl.idPlot).then(() => {
                            nextImageTrack();
                        });
                    }, cb)
                }
            ], () => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", pl));
            });
        }).catch(err => {
            if (err.name === "SequelizeUniqueConstraintError") {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists!"));
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    });
};