const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const asyncSeries = require('async/series');
const asyncLoop = require('async/each');
const exporter = require('./plot.exporter');
const fs = require('fs');
const path = require('path');
const lineModel = require('../line/line.model');
const wiFunctions = require('../utils/function');

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
};

function searchReferenceCurvePromise(idProject, dbConnection) {
    return new Promise(function (resolve) {
        searchReferenceCurve(idProject, dbConnection, function (err, idRefCurve) {
            if (err) {
                resolve(null);
            } else {
                resolve(idRefCurve);
            }
        });
    });
}

let searchReferenceCurve = function (idProject, dbConnection, callback) {
    let FamilyModel = dbConnection.Family;
    let CurveModel = dbConnection.Curve;
    let DatasetModel = dbConnection.Dataset;
    FamilyModel.findOne({
        where: {
            name: "Gamma Ray"
        }
    }).then(family => {
        if (family) {
            dbConnection.Well.findAll({where: {idProject: idProject}}).then(wells => {
                if (wells.length === 0) {
                    callback("No wells", false);
                } else {
                    asyncLoop(wells, function (well, nextWell) {
                        DatasetModel.findAll({where: {idWell: well.idWell}}).then((datasets) => {
                            if (datasets.length === 0) {
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
                                        } else {
                                            console.log("NOT CURVE");
                                            CurveModel.findOne({where: {idDataset: dataset.idDataset}}).then(c => {
                                                if (c) {
                                                    next(c.idCurve);
                                                } else {
                                                    next();
                                                }
                                            }).catch(err => {
                                                callback(err, null);
                                            });
                                        }
                                    });
                                }, function (idCurve) {
                                    nextWell(idCurve);
                                });
                            }
                        })
                    }, function (idCurve) {
                        if (idCurve) {
                            return callback(false, idCurve);
                        } else {
                            callback("No Curve", null);
                        }
                    })
                }
            });
        } else {
            callback("No family", null);
        }
    }).catch(err => {
        callback(err, null);
    })
};

function findCurveForTemplate(families, idProject, dbConnection, callback, idDataset) {
    //find curve in extractly dataset with idDataset !== null
    if (idDataset) {
        asyncLoop(families, function (family, next) {
            findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                if (idFamily) {
                    dbConnection.Curve.findOne({
                        where: {
                            idDataset: idDataset,
                            idFamily: idFamily
                        }
                    }).then(curve => {
                        if (curve) {
                            next(curve);
                        } else {
                            next();
                        }
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
    } else {
        asyncLoop(families, function (family, next) {
            findFamilyIdByName(family.name, dbConnection, function (idFamily) {
                if (idFamily) {
                    dbConnection.Well.findAll({where: {idProject: idProject}}).then(wells => {
                        asyncLoop(wells, function (well, nextWell) {
                            dbConnection.Dataset.findAll({where: {idWell: well.idWell}}).then(datasets => {
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
                                    nextWell(done);
                                });
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
}

let createPlotTemplate = function (myPlot, dbConnection, callback, username) {
    let familyWithErr = [];
    dbConnection.Plot.create({
        name: myPlot.name,
        option: myPlot.option,
        idProject: myPlot.idProject,
        referenceCurve: myPlot.referenceCurve,
        createdBy: myPlot.createdBy,
        updatedBy: myPlot.updatedBy
    }).then(plot => {
        let idPlot = plot.idPlot;
        asyncLoop(myPlot.depth_axes, function (depth_axis, next) {
            wiFunctions.getWellByDataset(myPlot.idDataset, dbConnection).then((well) => {
                depth_axis.idWell = well ? well.idWell : null;
                depth_axis.idPlot = idPlot;
                depth_axis.createdBy = myPlot.createdBy;
                depth_axis.updatedBy = myPlot.updatedBy;
                dbConnection.DepthAxis.create(depth_axis).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next(err);
                });
            });
        }, function (err) {
            asyncLoop(myPlot.tracks, function (track, nextTrack) {
                track.idPlot = idPlot;
                dbConnection.Track.create({
                    idPlot: track.idPlot,
                    orderNum: track.orderNum,
                    title: track.title,
                    createdBy: myPlot.createdBy,
                    updatedBy: myPlot.updatedBy
                }).then(t => {
                    let idTrack = t.idTrack;
                    asyncLoop(track.lines, function (line, nextLine) {
                        findCurveForTemplate(line.families, plot.idProject, dbConnection, function (err, curve) {
                            if (curve) {
                                console.log("FOUND CURVE : ", curve.name);
                                lineModel.createNewLineWithoutResponse({
                                    idCurve: curve.idCurve,
                                    idTrack: idTrack,
                                    createdBy: myPlot.createdBy,
                                    updatedBy: myPlot.updatedBy
                                }, dbConnection, username).then(() => {
                                    nextLine();
                                });
                            } else {
                                nextLine();
                            }
                        }, myPlot.idDataset);
                    }, function (done) {
                        if (done) nextTrack();
                        nextTrack();
                    });
                }).catch(err => {
                    console.log(err);
                    next(err);
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
};

let createNewPlot = function (plotInfo, done, dbConnection, username) {
    // searchReferenceCurvePromise(plotInfo.idProject, dbConnection).then(idRefCurve => {
    //     plotInfo.referenceCurve = idRefCurve;
    // });
    if (plotInfo.plotTemplate) {
        let myPlot = null;
        try {
            myPlot = require('./plot-template/' + plotInfo.plotTemplate + '.json');
        } catch (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot type not existed!", "PLOT TYPE TEMPLATE NOT FOUND"));
        }
        myPlot.referenceCurve = plotInfo.referenceCurve;
        myPlot.idProject = plotInfo.idProject;
        myPlot.name = plotInfo.name ? plotInfo.name : myPlot.name;
        myPlot.createdBy = plotInfo.createdBy;
        myPlot.updatedBy = plotInfo.updatedBy;
        myPlot.idDataset = plotInfo.idDataset || null;
        createPlotTemplate(myPlot, dbConnection, function (err, result) {
            if (err) {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists", "PLOT NAME EXISTED"));
            } else {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Create " + plotInfo.plotTemplate + " successful", result));
            }
        }, username);
    } else {
        let newPlot = {
            idProject: plotInfo.idProject,
            name: plotInfo.name,
            referenceCurve: plotInfo.referenceCurve,
            option: plotInfo.option,
            unit: plotInfo.unit,
            createdBy: plotInfo.createdBy,
            updatedBy: plotInfo.updatedBy
        };
        let isOverride = plotInfo.override || false;
        dbConnection.Plot.findOrCreate({
            where: {name: plotInfo.name, idProject: plotInfo.idProject},
            defaults: newPlot
        }).then(rs => {
            if (rs[1]) {
                //created new
                done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Plot success", rs[0]));
            } else {
                //existed
                if (isOverride) {
                    dbConnection.Plot.findById(rs[0].idPlot).then(delPlot => {
                        delPlot.destroy({force: true}).then(() => {
                            newPlot.idPlot = delPlot.idPlot;
                            dbConnection.Plot.create(newPlot).then((p) => {
                                done(ResponseJSON(ErrorCodes.SUCCESS, "Override plot success", p.toJSON()));
                            }).catch(err => {
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
                            });
                        })
                    });
                } else {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists!"));
                }
            }
        }).catch(err => {
            console.log(err);
            if (err.name === "SequelizeUniqueConstraintError") {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists!"));
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
    }
};

let editPlot = function (plotInfo, done, dbConnection) {
    delete plotInfo.createdBy;
    if (typeof(plotInfo.currentState) === "object") plotInfo.currentState = JSON.stringify(plotInfo.currentState);
    const Plot = dbConnection.Plot;
    Plot.findById(plotInfo.idPlot)
        .then(function (plot) {
            Object.assign(plot, plotInfo)
                .save()
                .then(function (a) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Plot success", plotInfo));
                })
                .catch(function (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists!"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for edit"));
        })
};

let deletePlot = function (plotInfo, done, dbConnection) {
    const Plot = dbConnection.Plot;
    Plot.findById(plotInfo.idPlot)
        .then(function (plot) {
            plot.setDataValue('updatedBy', plotInfo.updatedBy);
            plot.destroy({permanently: true, force: true})
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Plot is deleted", plot));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Plot not found for delete"));
        })
};

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
};

let duplicatePlot = function (payload, done, dbConnection, isSave) {
    let Plot = dbConnection.Plot;
    let Track = dbConnection.Track;
    let ImageTrack = dbConnection.ImageTrack;
    let ObjectTrack = dbConnection.ObjectTrack;
    let DepthAxis = dbConnection.DepthAxis;
    Plot.findById(payload.idPlot, {
        include: [{
            model: dbConnection.Track,
            include: [{
                model: dbConnection.Shading
            }, {
                model: dbConnection.Annotation
            }, {
                model: dbConnection.Line
            }]
        }, {
            model: dbConnection.DepthAxis
        }, {
            model: dbConnection.ImageTrack,
            include: {
                model: dbConnection.ImageOfTrack
            }
        }, {
            model: dbConnection.ObjectTrack,
            include: {
                model: dbConnection.ObjectOfTrack
            }
        }, {
            model: dbConnection.ZoneTrack
        }]
    }).then(rs => {
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
                newPlot.name = newPlot.name + "_COPY_" + rs.duplicated;
                newPlot.createdBy = payload.createdBy;
                newPlot.updatedBy = payload.updatedBy;
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
                            track.createdBy = payload.createdBy;
                            track.updatedBy = payload.updatedBy;
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
                                            line.createdBy = payload.createdBy;
                                            line.updatedBy = payload.updatedBy;
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
                                        let annotations = track.annotations;
                                        asyncLoop(annotations, function (annotation, nextAno) {
                                            delete annotation.idAnnotation;
                                            delete annotation.createAt;
                                            delete annotation.updatedAt;
                                            annotation.createdBy = payload.createdBy;
                                            annotation.updatedBy = payload.updatedBy;
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
                                        shading.createdBy = payload.createdBy;
                                        shading.updatedBy = payload.updatedBy;
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
                            depth_axis.createdBy = payload.createdBy;
                            depth_axis.updatedBy = payload.updatedBy;
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
                            image_track.createdBy = payload.createdBy;
                            image_track.updatedBy = payload.updatedBy;
                            image_track.idPlot = idPlot;
                            ImageTrack.create(image_track).then(d => {
                                let idImageTrack = d.idImageTrack;
                                let image_of_tracks = image_track.image_of_tracks;
                                asyncLoop(image_of_tracks, function (i, n) {
                                    delete i.idImageOfTrack;
                                    delete i.createdAt;
                                    delete i.updatedAt;
                                    i.createdBy = payload.createdBy;
                                    i.updatedBy = payload.updatedBy;
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
                            object_track.createdBy = payload.createdBy;
                            object_track.updatedBy = payload.updatedBy;
                            object_track.idPlot = idPlot;
                            ObjectTrack.create(object_track).then(d => {
                                let idObjectTrack = d.idObjectTrack;
                                let objectOfTracks = object_track.object_of_tracks;
                                asyncLoop(objectOfTracks, function (o, nextO) {
                                    delete o.idObjectOfTrack;
                                    delete o.createdAt;
                                    delete o.updatedAt;
                                    o.createdBy = payload.createdBy;
                                    o.updatedBy = payload.updatedBy;
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
                            zone_track.createdBy = payload.createdBy;
                            zone_track.updatedBy = payload.updatedBy;
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
};
module.exports = {
    duplicatePlot: duplicatePlot,
    createNewPlot: createNewPlot,
    editPlot: editPlot,
    deletePlot: deletePlot,
    getPlotInfo: getPlotInfo,
    // importPlotTemplate: importPlotTemplate
};
