const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const asyncSeries = require('async/series');
const asyncLoop = require('async/each');
const exporter = require('./exporter');
const fs = require('fs');
const path = require('path');
const lineModel = require('../line/line.model');
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

let searchReferenceCurve = function (idWell, dbConnection, callback) {
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
                        console.log("Dataset : ", dataset.idDataset, " Family : ", family.idFamily);
                        CurveModel.findOne({
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

function findCurveForTemplate(families, idWell, dbConnection, callback) {
    // console.log(families);
    asyncLoop(families, function (family, next) {
        console.log(family);
        findFamilyIdByName(family.name, dbConnection, function (idFamily) {
            if (idFamily) {
                dbConnection.Dataset.findAll({where: {idWell: idWell}}).then(datasets => {
                    asyncLoop(datasets, function (dataset, nextDataset) {
                        dbConnection.Curve.findOne({
                            where: {
                                idDataset: dataset.idDataset,
                                idFamily: idFamily
                            }
                        }).then(curve => {
                            if (curve) {
                                nextDataset(curve);
                            } else {
                                nextDataset();
                            }
                        });
                    }, function (done) {
                        if (done) return next(done);
                        next();
                    });
                });
            } else {
                next();
            }
        });
    }, function (done) {
        if (done) {
            console.log("BREAK");
            return callback(null, done);
        }
        console.log("DONE ALL FAMILY");
        return callback(null, null);
    });
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
            asyncLoop(myPlot.tracks, function (track, nextTrack) {
                track.idPlot = idPlot;
                dbConnection.Track.create({
                    idPlot: track.idPlot,
                    orderNum: track.orderNum,
                    title: track.title
                }).then(t => {
                    let idTrack = t.idTrack;
                    asyncLoop(track.lines, function (line, nextLine) {
                        findCurveForTemplate(line.families, plot.idWell, dbConnection, function (err, curve) {
                            if (curve) {
                                console.log("FOUND CURVE : ", curve.name);
                                lineModel.createNewLineWithoutResponse({
                                    idCurve: curve.idCurve,
                                    idTrack: idTrack
                                }, dbConnection, "", function () {
                                    nextLine();
                                });
                            } else {
                                nextLine();
                            }
                        });
                    }, function (done) {
                        if (done) nextTrack();
                        nextTrack();
                    });
                    // asyncLoop(track.lines, function (line, next) {
                    //     asyncLoop(line.families, function (family, next) {
                    //         findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                    //             console.log("ID FAMILY ", idFamily);
                    //             if (idFamily) {
                    //                 dbConnection.Dataset.findAll({where: {idWell: myPlot.idWell}}).then(datasets => {
                    //                     asyncLoop(datasets, function (dataset, nextDataset) {
                    //                         dbConnection.Curve.findOne({
                    //                             where: {
                    //                                 idFamily: idFamily,
                    //                                 idDataset: dataset.idDataset
                    //                             }
                    //                         }).then(curve => {
                    //                             if (curve) {
                    //                                 // console.log("FOUND CURVE : NEXT ", curve.name);
                    //                                 lineModel.createNewLineWithoutResponse({
                    //                                     idCurve: curve.idCurve,
                    //                                     idTrack: idTrack
                    //                                 }, dbConnection, username, function (line) {
                    //                                     nextDataset();
                    //                                 });
                    //                             } else {
                    //                                 // console.log("NOT FOUND CURVE NEXT");
                    //                                 familyWithErr.push(family.name);
                    //                                 nextDataset();
                    //                             }
                    //                         });
                    //                     }, function () {
                    //                         next();
                    //                     });
                    //                 });
                    //             } else {
                    //                 next();
                    //             }
                    //         });
                    //     }, function (curve) {
                    //         next();
                    //     });
                    // }, function (line) {
                    //     next();
                    // });
                }).catch(err => {
                    // next(err);
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

let createNewPlot = function (plotInfo, done, dbConnection, username) {
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
                            const plot = Plot.build({
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
                                    if (err.name === "SequelizeUniqueConstraintError") {
                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
                                    } else {
                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                                    }
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
                            const plot = Plot.build({
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
                                    if (err.name === "SequelizeUniqueConstraintError") {
                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
                                    } else {
                                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                                    }
                                });
                        },
                        function () {
                            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
                        }
                    )
            }
        }
    });
}

let editPlot = function (plotInfo, done, dbConnection) {
    const Plot = dbConnection.Plot;
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
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for edit"));
        })
}

let deletePlot = function (plotInfo, done, dbConnection) {
    const Plot = dbConnection.Plot;
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

let getPlotInfo = function (plot, done, dbConnection) {
    const Plot = dbConnection.Plot;
    Plot.findById(plot.idPlot, {include: [{all: true, include: [{all: true}]}]})
        .then(function (plot) {
            if (!plot) throw "not exists";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Plot success", plot));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for get info"));
        })
}

let duplicatePlot = function (payload, done, dbConnection, isSave) {
    let Plot = dbConnection.Plot;
    let Track = dbConnection.Track;
    let ImageTrack = dbConnection.ImageTrack;
    let ObjectTrack = dbConnection.ObjectTrack;
    let DepthAxis = dbConnection.DepthAxis;
    Plot.findById(payload.idPlot, {include: [{all: true, include: [{all: true, include: {all: true}}]}]}).then(rs => {
        if (rs) {
            let newPlot = rs.toJSON();
            delete newPlot.idPlot;
            delete newPlot.createdAt;
            delete newPlot.updatedAt;
            console.log(isSave);
            if (isSave) {
                newPlot.name = isSave;
            } else {
                // newPlot.name = newPlot.name + "_" + new Date().toLocaleString('en-US', {timeZone: "Asia/Ho_Chi_Minh"});
                newPlot.duplicated = 1;
                newPlot.name = newPlot.name + "_Copy_" + rs.duplicated;
                rs.duplicated += 1;
                rs.save();
            }
            Plot.create(newPlot).then(pl => {
                let idPlot = pl.idPlot;
                asyncSeries([
                    function (cb) {
                        let tracks = newPlot.tracks;
                        asyncLoop(tracks, function (track, nextTrack) {
                            delete track.idTrack;
                            delete track.createdAt;
                            delete track.updatedAt;
                            track.idPlot = idPlot;
                            Track.create(track).then(tr => {
                                let idTrack = tr.idTrack;
                                asyncSeries([
                                    function (cb) {
                                        let lines = track.lines;
                                        let lineArr = [];
                                        asyncLoop(lines, function (line, nextLine) {
                                            let oldLine = line.idLine;
                                            delete line.idLine;
                                            delete line.createAt;
                                            delete line.updatedAt;
                                            line.idTrack = idTrack;
                                            dbConnection.Line.create(line).then((l) => {
                                                lineArr.push({oldLine: oldLine, newLine: l.idLine});
                                                nextLine();
                                            }).catch(err => {
                                                console.log(err);
                                                nextLine();
                                            });
                                        }, function () {
                                            cb(null, lineArr);
                                        });
                                    },
                                    function (cb) {
                                        let markers = track.markers;
                                        asyncLoop(markers, function (marker, nextMarker) {
                                            delete marker.idMarker;
                                            delete marker.createAt;
                                            delete marker.updatedAt;
                                            marker.idTrack = idTrack;
                                            dbConnection.Marker.create(marker).then(() => {
                                                nextMarker();
                                            }).catch(err => {
                                                console.log(err);
                                                nextMarker();
                                            });
                                        }, function () {
                                            cb(null, true);
                                        });
                                    },
                                    function (cb) {
                                        let annotations = track.annotations;
                                        asyncLoop(annotations, function (annotation, nextAno) {
                                            delete annotation.idAnnotation;
                                            delete annotation.createAt;
                                            delete annotation.updatedAt;
                                            annotation.idTrack = idTrack;
                                            dbConnection.Annotation.create(annotation).then(() => {
                                                nextAno();
                                            }).catch(err => {
                                                console.log(err);
                                                nextAno();
                                            });
                                        }, function () {
                                            cb(null, true);
                                        });
                                    }
                                ], function (err, result) {
                                    let shadings = track.shadings;
                                    let myLine = result[0];
                                    asyncLoop(shadings, function (shading, nextShading) {
                                        delete shading.idShading;
                                        delete shading.createdAt;
                                        delete shading.updatedAt;
                                        shading.idTrack = idTrack;
                                        asyncSeries([
                                            function (cb) {
                                                let findLine = myLine.find(l => l.oldLine === shading.idLeftLine);
                                                shading.idLeftLine = findLine ? findLine.newLine : null;
                                                cb();
                                            },
                                            function (cb) {
                                                let findLine = myLine.find(l => l.oldLine === shading.idRightLine);
                                                shading.idRightLine = findLine ? findLine.newLine : null;
                                                cb();
                                            },
                                            function (cb) {
                                                dbConnection.Shading.create(shading).then(() => {
                                                    cb();
                                                }).catch(err => {
                                                    cb();
                                                });
                                            }
                                        ], function () {
                                            nextShading();
                                        })
                                    }, function () {
                                        nextTrack();
                                    });
                                });
                            }).catch(err => {
                                console.log(err);
                                nextTrack();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        let depth_axes = newPlot.depth_axes;
                        asyncLoop(depth_axes, function (depth_axis, nextDepth) {
                            delete depth_axis.idDepthAxis;
                            delete depth_axis.createdAt;
                            delete depth_axis.updatedAt;
                            depth_axis.idPlot = idPlot;
                            DepthAxis.create(depth_axis).then(d => {
                                nextDepth();
                            }).catch(err => {
                                nextDepth();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        let image_tracks = newPlot.image_tracks;
                        asyncLoop(image_tracks, function (image_track, nextImg) {
                            delete image_track.idImageTrack;
                            delete image_track.createdAt;
                            delete image_track.updatedAt;
                            image_track.idPlot = idPlot;
                            ImageTrack.create(image_track).then(d => {
                                let idImageTrack = d.idImageTrack;
                                let image_of_tracks = image_track.image_of_tracks;
                                asyncLoop(image_of_tracks, function (i, n) {
                                    delete i.idImageOfTrack;
                                    delete i.createdAt;
                                    delete i.updatedAt;
                                    i.idImageTrack = idImageTrack;
                                    dbConnection.ImageOfTrack.create(i).then(() => {
                                        n();
                                    }).catch((err) => {
                                        console.log(err);
                                        n();
                                    });
                                }, function () {
                                    nextImg();
                                });
                            }).catch(err => {
                                nextImg();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        let object_tracks = newPlot.object_tracks;
                        asyncLoop(object_tracks, function (object_track, next) {
                            delete object_track.idObjectTrack;
                            delete object_track.createdAt;
                            delete object_track.updatedAt;
                            object_track.idPlot = idPlot;
                            ObjectTrack.create(object_track).then(d => {
                                let idObjectTrack = d.idObjectTrack;
                                let objectOfTracks = object_track.object_of_tracks;
                                asyncLoop(objectOfTracks, function (o, nextO) {
                                    delete o.idObjectOfTrack;
                                    delete o.createdAt;
                                    delete o.updatedAt;
                                    o.idObjectTrack = idObjectTrack;
                                    dbConnection.ObjectOfTrack.create(o).then(() => {
                                        nextO();
                                    }).catch(err => {
                                        nextO();
                                    })
                                }, function () {
                                    next();
                                })
                            }).catch(err => {
                                next();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        let zone_tracks = newPlot.zone_tracks;
                        asyncLoop(zone_tracks, function (zone_track, next) {
                            delete zone_track.idZoneTrack;
                            delete zone_track.createdAt;
                            delete zone_track.updatedAt;
                            zone_track.idPlot = idPlot;
                            dbConnection.ZoneTrack.create(zone_track).then(d => {
                                next();
                            }).catch(err => {
                                next();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    }
                ], function (err, result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", pl));
                });
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "err", err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Plot"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
    });
}

let exportData = function (payload, done, error, dbConnection) {
    let Plot = dbConnection.Plot;
    Plot.findById(payload.idPlot, {
        include: {all: true, include: {all: true, include: {all: true}}}
    }).then(rs => {
        if (!rs) throw "Not exists!";
        rs = rs.toJSON();
        let myPlot = new Object();
        myPlot.name = rs.name;
        myPlot.option = rs.option;
        asyncSeries([
            function (cb) {
                myPlot.tracks = new Array();
                asyncLoop(rs.tracks, function (track, next) {
                    delete track.idTrack;
                    delete track.createdAt;
                    delete track.updatedAt;
                    delete track.idPlot;
                    asyncSeries([
                        function (cb) {
                            asyncLoop(track.lines, function (line, next) {
                                delete line.idLine;
                                delete line.createdAt;
                                delete line.updatedAt;
                                delete line.idTrack;
                                delete line.idCurve;
                                dbConnection.Dataset.findById(line.curve.idDataset).then(dataset => {
                                    let curve = {
                                        datasetName: dataset.name,
                                        curveName: line.curve.name
                                    }
                                    line.curve = curve;
                                    next();
                                });
                            }, function () {
                                cb(null, true);
                            });
                        },
                        function (cb) {
                            asyncLoop(track.shadings, function (shading, next) {
                                delete shading.idShading;
                                delete shading.createdAt;
                                delete shading.updatedAt;
                                delete shading.idTrack;
                                delete shading.curve;
                                delete shading.idControlCurve;
                                asyncSeries([
                                    function (cb) {
                                        if (shading.idLeftLine) {
                                            shading.leftLine = shading.leftLine.alias;
                                            cb();
                                        } else {
                                            shading.leftLine = null;
                                            cb();
                                        }
                                    },
                                    function (cb) {
                                        if (shading.idRightLine) {
                                            shading.rightLine = shading.rightLine.alias;
                                            cb();
                                        } else {
                                            shading.rightLine = null;
                                            cb();
                                        }
                                    }
                                ], function () {
                                    delete shading.idLeftLine;
                                    delete shading.idRightLine;
                                    next();
                                });
                            }, function () {
                                cb(null, true);
                            });
                        },
                        function (cb) {
                            asyncLoop(track.markers, function (marker, next) {
                                delete marker.idMarker;
                                delete marker.createdAt;
                                delete marker.updatedAt;
                                delete marker.idTrack;
                                next();
                            }, function () {
                                cb(null, true);
                            });
                        },
                        function (cb) {
                            asyncLoop(track.annotations, function (anootation, next) {
                                delete anootation.idAnnotation;
                                delete anootation.createdAt;
                                delete anootation.updatedAt;
                                delete anootation.idTrack;
                                next();
                            }, function () {
                                cb(null, true);
                            });
                        }
                    ], function (err, result) {
                        myPlot.tracks.push(track);
                        next();
                    });
                }, function () {
                    cb(null, true);
                });
            },
            function (cb) {
                myPlot.depth_axes = new Array();
                asyncLoop(rs.depth_axes, function (depth_axis, next) {
                    delete depth_axis.idDepthAxis;
                    delete depth_axis.createdAt;
                    delete depth_axis.updatedAt;
                    delete depth_axis.idPlot;
                    myPlot.depth_axes.push(depth_axis);
                    next();
                }, function () {
                    cb(null, true);
                });
            },
            function (cb) {
                myPlot.image_tracks = new Array();
                asyncLoop(rs.image_tracks, function (image_track, next) {
                    delete image_track.idImageTrack;
                    delete image_track.createdAt;
                    delete image_track.updatedAt;
                    delete image_track.idPlot;
                    asyncLoop(image_track.image_of_tracks, function (image_of_track, next) {
                        delete image_of_track.idImageOfTrack;
                        delete image_of_track.createdAt;
                        delete image_of_track.updatedAt;
                        delete image_of_track.idImageTrack;
                        next();
                    }, function () {
                        myPlot.image_tracks.push(image_track);
                        next();
                    });
                }, function () {
                    cb(null, true);
                });
            },
            function (cb) {
                myPlot.object_tracks = new Array();
                asyncLoop(rs.object_tracks, function (object_track, next) {
                    delete object_track.idObjectTrack;
                    delete object_track.createdAt;
                    delete object_track.updatedAt;
                    delete object_track.idPlot;
                    myPlot.object_tracks.push(object_track);
                    next();
                }, function () {
                    cb(null, true);
                });
            },
            function (cb) {
                myPlot.zone_tracks = new Array();
                asyncLoop(rs.zone_tracks, function (zone_track, next) {
                    delete zone_track.idZoneTrack;
                    delete zone_track.createdAt;
                    delete zone_track.updatedAt;
                    delete zone_track.idPlot;
                    delete zone_track.idZoneSet;
                    zone_track.zoneset = zone_track.zoneset ? zone_track.zoneset.name : zone_track.zoneset;
                    myPlot.zone_tracks.push(zone_track);
                    next();
                }, function () {
                    cb(null, true);
                });
            }
        ], function (err, result) {
            exporter.exportData(myPlot, done);
        });
    }).catch(err => {
        console.log(err);
        error(404);
    })
}

let importPlotTemplate = async function (req, done, dbConnection) {
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType != 'plot') {
        fs.unlinkSync(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .plot files allowed!"));
    }
    fs.readFile(filePath, 'utf8', async function (err, data) {
        if (err) console.log(err);
        let myPlot = JSON.parse(data);
        let plot = new Object();
        plot.name = req.body.plotName ? req.body.plotName : myPlot.name;
        plot.option = myPlot.option;
        plot.idWell = req.body.idWell;
        let well = await dbConnection.Well.findById(plot.idWell);
        searchReferenceCurve(req.body.idWell, dbConnection, function (err, idRefCurve) {
            plot.referenceCurve = idRefCurve;
            dbConnection.Plot.create(plot).then(rs => {
                let idPlot = rs.idPlot;
                asyncSeries([
                    function (cb) {
                        asyncLoop(myPlot.tracks, function (track, next) {
                            track.idPlot = idPlot;
                            dbConnection.Track.create(track).then(tr => {
                                let idTrack = tr.idTrack;
                                asyncSeries([
                                    function (cb) {
                                        asyncLoop(track.lines, function (line, next) {
                                            line.idTrack = idTrack;
                                            dbConnection.Dataset.findOne({
                                                where: {idWell: rs.idWell, name: line.curve.datasetName}
                                            }).then(dataset => {
                                                if (dataset) {
                                                    dbConnection.Curve.findOne({
                                                        where: {
                                                            idDataset: dataset.idDataset,
                                                            name: line.curve.curveName
                                                        }
                                                    }).then(curve => {
                                                        if (curve) {
                                                            line.idCurve = curve.idCurve;
                                                            dbConnection.Line.create(line).then(l => {
                                                                next();
                                                            }).catch(err => {
                                                                next();
                                                            })
                                                        } else {
                                                            next();
                                                        }
                                                    }).catch(err => {
                                                        next();
                                                    })
                                                } else {
                                                    console.log("No dataset");
                                                    next();
                                                }
                                            }).catch(err => {
                                                next();
                                            });
                                        }, function () {
                                            cb();
                                        });
                                    },
                                    function (cb) {
                                        asyncLoop(track.shadings, function (shading, next) {
                                            shading.idTrack = idTrack;
                                            delete shading.idControlCurve;
                                            asyncSeries([
                                                function (c) {
                                                    if (shading.leftLine) {
                                                        dbConnection.Line.findOne({
                                                            where: {
                                                                idTrack: idTrack,
                                                                alias: shading.leftLine
                                                            }
                                                        }).then(line => {
                                                            if (line) {
                                                                shading.idLeftLine = line.idLine;
                                                                dbConnection.Shading.create(shading).then(() => {
                                                                    c();
                                                                }).catch(err => {
                                                                    c();
                                                                });
                                                            } else {
                                                                c();
                                                            }
                                                        }).catch(err => {
                                                            c();
                                                        });
                                                    } else {
                                                        c();
                                                    }
                                                },
                                                function (c) {
                                                    if (shading.rightLine) {
                                                        dbConnection.Line.findOne({
                                                            where: {
                                                                idTrack: idTrack,
                                                                alias: shading.rightLine
                                                            }
                                                        }).then(line => {
                                                            if (line) {
                                                                shading.idRightLine = line.idLine;
                                                                dbConnection.Shading.create(shading).then(() => {
                                                                    c();
                                                                }).catch(err => {
                                                                    c();
                                                                });
                                                            } else {
                                                                c();
                                                            }
                                                        }).catch(err => {
                                                            c();
                                                        });
                                                    } else {
                                                        c();
                                                    }
                                                }
                                            ], function () {
                                                next();
                                            });
                                        }, function () {
                                            cb(null, true);
                                        })
                                    },
                                    function (cb) {
                                        asyncLoop(track.markers, function (marker, next) {
                                            marker.idTrack = idTrack;
                                            if (marker.depth < well.topDepth || marker.depth > well.bottomDepth) {
                                                next();
                                            } else {
                                                dbConnection.Marker.create(marker).then(() => {
                                                    next();
                                                }).catch(err => {
                                                    next();
                                                    console.log(err);
                                                });
                                            }
                                        }, function () {
                                            cb(null, true);
                                        });
                                    },
                                    function (cb) {
                                        asyncLoop(track.annotations, function (annotation, next) {
                                            annotation.idTrack = idTrack;
                                            if (annotation.top < well.topDepth) annotation.top = well.topDepth;
                                            if (annotation.bottom > well.bottomDepth) annotation.bottom = well.bottomDepth;
                                            console.log("=============== ", annotation);
                                            dbConnection.Annotation.create(annotation).then(() => {
                                                console.log("===============//// ", annotation);
                                                next();
                                            }).catch(err => {
                                                console.log(err);
                                            })
                                        }, function () {
                                            cb(null, true);
                                        });
                                    }
                                ], function (err, result) {
                                    next();
                                });
                            }).catch(err => {
                                console.log(err);
                                next();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        asyncLoop(myPlot.depth_axes, function (depth_axis, next) {
                            depth_axis.idPlot = idPlot;
                            dbConnection.DepthAxis.create(depth_axis).then(depth => {
                                next();
                            }).catch(err => {
                                console.log(err);
                                next();
                            })
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        asyncLoop(myPlot.image_tracks, function (image_track, next) {
                            image_track.idPlot = idPlot;
                            dbConnection.ImageTrack.create(image_track).then(img => {
                                let idImageTrack = img.idImageTrack;
                                asyncLoop(image_track.image_of_tracks, function (image_of_track, next) {
                                    image_of_track.idImageTrack = idImageTrack;
                                    dbConnection.ImageOfTrack.create(image_of_track).then(() => {
                                        next();
                                    }).catch(() => {
                                        next();
                                    });
                                }, function () {
                                    next();
                                });
                            }).catch(err => {
                                console.log(err);
                                next();
                            })
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        asyncLoop(myPlot.object_tracks, function (object_track, next) {
                            object_track.idPlot = idPlot;
                            dbConnection.ObjectTrack.create(object_track).then(obj => {
                                next();
                            }).catch(err => {
                                console.log(err);
                                next();
                            })
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        asyncLoop(myPlot.zone_tracks, function (zone_track, next) {
                            zone_track.idPlot = idPlot;
                            dbConnection.ZoneTrack.create(zone_track).then(zo => {
                                dbConnection.ZoneSet.findOne({
                                    where: {
                                        idWell: plot.idWell,
                                        name: zone_track.zoneset
                                    }
                                }).then(zs => {
                                    if (zs) {
                                        zo.idZoneSet = zs.idZoneSet;
                                        zo.save().then(() => {
                                            next();
                                        }).catch(() => {
                                            next();
                                        })
                                    } else {
                                        next();
                                    }
                                });
                            }).catch(err => {
                                console.log(err);
                                next();
                            })
                        }, function () {
                            cb(null, true);
                        });
                    }
                ], function (err, result) {
                    fs.unlinkSync(filePath);
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successsful", {idPlot: rs.idPlot}));
                });
            }).catch(err => {
                fs.unlinkSync(filePath);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot name existed!", err.message));
            });
        });

    });
}
module.exports = {
    duplicatePlot: duplicatePlot,
    createNewPlot: createNewPlot,
    editPlot: editPlot,
    deletePlot: deletePlot,
    getPlotInfo: getPlotInfo,
    exportData: exportData,
    importPlotTemplate: importPlotTemplate
};