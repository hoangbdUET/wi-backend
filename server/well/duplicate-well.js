let asyncEach = require('async/each');
let asyncParallel = require('async/parallel');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let config = require('config');
let fsExtra = require('fs-extra');
let asyncWaterfall = require('async/waterfall');


module.exports = function (idWell, done, dbConnection, username) {
    dbConnection.Well.findById(idWell, {
        include: [
            {
                model: dbConnection.Dataset
            },
            {
                model: dbConnection.Plot
            },
            {
                model: dbConnection.CrossPlot
            },
            {
                model: dbConnection.Histogram
            },
            {
                model: dbConnection.ZoneSet
            },
            {
                model: dbConnection.WellHeader
            }
        ]
    }).then(async well => {
        let newWell;
        if (well) {
            newWell = well.toJSON();
            delete newWell.createdAt;
            delete newWell.updatedAt;
            delete newWell.deletedAt;
            delete newWell.idWell;
            newWell.duplicated = 1;
            newWell.name = newWell.name + "_Copy_" + well.duplicated;
            well.duplicated++;
            await well.save();
            let _well = await dbConnection.Well.create(newWell);
            let _project = await dbConnection.Project.findById(newWell.idProject);
            asyncWaterfall([
                function (cb) {
                    let curvesReference = {};
                    asyncEach(well.datasets, function (dataset, nextDataset) {
                        dbConnection.Dataset.create({
                            name: dataset.name,
                            datasetKey: dataset.datasetKey,
                            datasetLabel: dataset.datasetLabel,
                            idWell: _well.idWell
                        }).then(_dataset => {
                            dbConnection.Curve.findAll({where: {idDataset: dataset.idDataset}}).then(curves => {
                                asyncEach(curves, function (curve, nextCurve) {
                                    let curvePath = hashDir.createPath(config.curveBasePath, username + _project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                    dbConnection.Curve.create({
                                        name: curve.name,
                                        unit: curve.unit,
                                        idDataset: _dataset.idDataset,
                                        initValue: "well-duplicated"
                                    }).then(_curve => {
                                        curvesReference[curve.idCurve] = _curve.idCurve;
                                        let newCurvePath = hashDir.createPath(config.curveBasePath, username + _project.name + _well.name + _dataset.name + _curve.name, _curve.name + '.txt');
                                        try {
                                            fsExtra.copy(curvePath, newCurvePath, function (err) {
                                                if (err) {
                                                    throw err;
                                                }
                                                nextCurve();
                                            });
                                        } catch (e) {
                                            console.log(e);
                                            nextCurve();
                                        }
                                    });
                                }, function () {
                                    nextDataset();
                                });
                            });
                        });
                    }, function () {
                        console.log("Done curves");
                        cb(null, curvesReference);
                    });
                },
                function (curvesReference, cb) {
                    let zonesetsReference = {};
                    asyncEach(well.zonesets, function (zoneset, nextzs) {
                        let zs = zoneset.toJSON();
                        delete zs.idZoneSet;
                        delete zs.createdAt;
                        delete zs.updatedAt;
                        zs.idWell = _well.idWell;
                        dbConnection.ZoneSet.create(zs).then(rs => {
                            if (rs) {
                                dbConnection.Zone.findAll({where: {idZoneSet: zoneset.idZoneSet}}).then(zones => {
                                    asyncEach(zones, function (zone, nextz) {
                                        let z = zone.toJSON();
                                        delete z.idZone;
                                        delete z.createdAt;
                                        delete z.updatedAt;
                                        z.idZoneSet = rs.idZoneSet;
                                        dbConnection.Zone.create(z).then(rs => {
                                            zonesetsReference[zoneset.idZoneSet] = rs.idZoneSet;
                                            nextz();
                                        }).catch(err => {
                                            console.log(err);
                                            nextz();
                                        });
                                    }, function () {
                                        nextzs();
                                    });
                                });
                            } else {
                                nextzs();
                            }
                        }).catch(err => {
                            console.log(err);
                            nextzs();
                        });
                    }, function () {
                        console.log("Done zonesets");
                        cb(null, curvesReference, zonesetsReference);
                    });
                },
                function (curvesReference, zonesetsReference, cb) {
                    let histogramsReference = {};
                    asyncEach(well.histograms, function (histogram, next) {
                        let newHistogram = histogram.toJSON();
                        delete newHistogram.idHistogram;
                        delete newHistogram.createdAt;
                        delete newHistogram.updatedAt;
                        newHistogram.idWell = _well.idWell;
                        newHistogram.idCurve = newHistogram.idCurve ? curvesReference[newHistogram.idCurve] : null;
                        newHistogram.idZoneSet = newHistogram.idZoneSet ? zonesetsReference[newHistogram.idZoneSet] : null;
                        dbConnection.Histogram.create(newHistogram).then(h => {
                            dbConnection.ReferenceCurve.findAll({where: {idHistogram: histogram.idHistogram}}).then(refCurves => {
                                histogramsReference[histogram.idHistogram] = h.idHistogram;
                                asyncEach(refCurves, function (refCurve, nextRefCurve) {
                                    let newReferenceCurve = refCurve.toJSON();
                                    delete newReferenceCurve.idReferenceCurve;
                                    delete newReferenceCurve.createdAt;
                                    delete newReferenceCurve.updatedAt;
                                    newReferenceCurve.idHistogram = h.idHistogram;
                                    newReferenceCurve.idCurve = newReferenceCurve.idCurve ? curvesReference[newReferenceCurve.idCurve] : null;
                                    dbConnection.ReferenceCurve.create(newReferenceCurve).then(() => {
                                        nextRefCurve();
                                    });
                                }, function () {
                                    next();
                                });
                            });

                        }).catch(err => {
                            console.log(err);
                            next();
                        });
                    }, function () {
                        console.log("Done histograms");
                        cb(null, curvesReference, zonesetsReference, histogramsReference);
                    });
                },
                function (curvesReference, zonesetsReference, histogramsReference, cb) {
                    //polygon, regressionline, referenceCurve, ternary, pointset, userdefineline
                    let crossplotsReference = {};
                    asyncEach(well.crossplots, function (crossplot, next) {
                        let newCrossPlot = crossplot.toJSON();
                        delete newCrossPlot.idCrossPlot;
                        delete newCrossPlot.createdAt;
                        delete newCrossPlot.updatedAt;
                        newCrossPlot.idWell = _well.idWell;
                        dbConnection.CrossPlot.create(newCrossPlot).then(c => {
                            crossplotsReference[crossplot.idCrossPlot] = c.idCrossPlot;
                            asyncParallel([
                                function (callback) {
                                    dbConnection.PointSet.findAll({where: {idCrossPlot: crossplot.idCrossPlot}}).then(pointsets => {
                                        asyncEach(pointsets, function (pointset, nextPoint) {
                                            let newPointSet = pointset.toJSON();
                                            delete newPointSet.idPointSet;
                                            delete newPointSet.createdAt;
                                            delete newPointSet.updatedAt;
                                            newPointSet.idCrossPlot = c.idCrossPlot;
                                            newPointSet.idCurveX = newPointSet.idCurveX ? curvesReference[newPointSet.idCurveX] : null;
                                            newPointSet.idCurveY = newPointSet.idCurveY ? curvesReference[newPointSet.idCurveY] : null;
                                            newPointSet.idCurveZ = newPointSet.idCurveZ ? curvesReference[newPointSet.idCurveZ] : null;
                                            newPointSet.idWell = _well.idWell;
                                            newPointSet.idZoneSet = newPointSet.idZoneSet ? zonesetsReference[newPointSet.idZoneSet] : null;
                                            dbConnection.PointSet.create(newPointSet).then(() => {
                                                nextPoint();
                                            }).catch(err => {
                                                console.log(err);
                                                nextPoint();
                                            });
                                        }, function () {
                                            callback();
                                        });
                                    });
                                },
                                function (callback) {
                                    dbConnection.ReferenceCurve.findAll({where: {idCrossPlot: crossplot.idCrossPlot}}).then(refCurves => {
                                        asyncEach(refCurves, function (refCurve, nextRefCurve) {
                                            let newReferenceCurve = refCurve.toJSON();
                                            delete newReferenceCurve.idReferenceCurve;
                                            delete newReferenceCurve.createdAt;
                                            delete newReferenceCurve.updatedAt;
                                            newReferenceCurve.idCrossPlot = c.idCrossPlot;
                                            newReferenceCurve.idCurve = newReferenceCurve.idCurve ? curvesReference[newReferenceCurve.idCurve] : null;
                                            dbConnection.ReferenceCurve.create(newReferenceCurve).then(() => {
                                                nextRefCurve();
                                            });
                                        }, function () {
                                            callback();
                                        });
                                    });

                                },
                                function (callback) {
                                    dbConnection.RegressionLine.findAll({where: {idCrossPlot: crossplot.idCrossPlot}}).then(lines => {
                                        asyncEach(lines, function (line, nextLine) {
                                            let newLine = line.toJSON();
                                            delete newLine.idRegressionLine;
                                            delete newLine.createdAt;
                                            delete newLine.updatedAt;
                                            newLine.idCrossPlot = c.idCrossPlot;
                                            dbConnection.RegressionLine.create(newLine).then(l => {
                                                nextLine();
                                            }).catch(err => {
                                                console.log(err);
                                                nextLine();
                                            })
                                        }, function () {
                                            callback();
                                        });
                                    });
                                },
                                function (callback) {
                                    dbConnection.Polygon.findAll({where: {idCrossPlot: crossplot.idCrossPlot}}).then(polygons => {
                                        asyncEach(polygons, function (polygon, nextPolygon) {
                                            let newPolygon = polygon.toJSON();
                                            delete newPolygon.idPolygon;
                                            delete newPolygon.createdAt;
                                            delete newPolygon.updatedAt;
                                            newPolygon.idCrossPlot = c.idCrossPlot;
                                            dbConnection.Polygon.create(newPolygon).then(p => {
                                                nextPolygon();
                                            }).catch(err => {
                                                console.log(err);
                                                nextPolygon();
                                            })
                                        }, function () {
                                            callback();
                                        });
                                    });
                                },
                                function (callback) {
                                    dbConnection.Ternary.findAll({where: {idCrossPlot: crossplot.idCrossPlot}}).then(ternaries => {
                                        asyncEach(ternaries, function (ternary, nextTernary) {
                                            let newTerary = ternary.toJSON();
                                            delete newTerary.idTernary;
                                            delete newTerary.createdAt;
                                            delete newTerary.updatedAt;
                                            newTerary.idCrossPlot = c.idCrossPlot;
                                            dbConnection.Ternary.create(newTerary).then(t => {
                                                nextTernary();
                                            }).catch(err => {
                                                console.log(err);
                                                nextTernary();
                                            });
                                        }, function () {
                                            callback();
                                        });
                                    });
                                },
                                function (callback) {
                                    dbConnection.UserDefineLine.findAll({where: {idCrossPlot: crossplot.idCrossPlot}}).then(lines => {
                                        asyncEach(lines, function (line, nextLine) {
                                            let newLine = line.toJSON();
                                            delete newLine.idUserDefineLine;
                                            delete newLine.createdAt;
                                            delete newLine.updatedAt;
                                            dbConnection.UserDefineLine.create(newLine).then(l => {
                                                nextLine();
                                            }).catch(err => {
                                                console.log(err);
                                                nextLine();
                                            })
                                        }, function () {
                                            callback();
                                        });
                                    });
                                }
                            ], function () {
                                next();
                            });
                        }).catch(err => {
                            console.log(err);
                            next();
                        });
                    }, function () {
                        console.log("Done cross plots");
                        cb(null, curvesReference, zonesetsReference, histogramsReference, crossplotsReference);
                    });
                },
                function (curvesReference, zonesetsReference, histogramsReference, crossplotsReference, cb) {
                    asyncEach(well.plots, function (plot, nextPlot) {
                        let newPlot = plot.toJSON();
                        delete newPlot.idPlot;
                        delete newPlot.createdAt;
                        delete newPlot.updatedAt;
                        newPlot.idWell = _well.idWell;
                        newPlot.referenceCurve = newPlot.referenceCurve ? curvesReference[newPlot.referenceCurve] : null;
                        dbConnection.Plot.create(newPlot).then(p => {
                            asyncParallel([
                                function (callback) {
                                    dbConnection.Track.findAll({
                                        where: {idPlot: plot.idPlot},
                                        include: [{model: dbConnection.Line}, {model: dbConnection.Shading}, {model: dbConnection.Marker}, {model: dbConnection.Annotation}]
                                    }).then(tracks => {
                                        asyncEach(tracks, function (track, nextTrack) {
                                            let newTrack = track.toJSON();
                                            delete newTrack.idTrack;
                                            delete newTrack.createdAt;
                                            delete newTrack.updatedAt;
                                            newTrack.idPlot = p.idPlot;
                                            dbConnection.Track.create(newTrack).then(t => {
                                                asyncWaterfall([
                                                    function (cbLine) {
                                                        let linesReference = {};
                                                        asyncEach(track.lines, function (line, nextLine) {
                                                            let newLine = line.toJSON();
                                                            delete newLine.idLine;
                                                            delete newLine.createdAt;
                                                            delete newLine.updatedAt;
                                                            newLine.idTrack = t.idTrack;
                                                            newLine.idCurve = curvesReference[newLine.idCurve];
                                                            dbConnection.Line.create(newLine).then(l => {
                                                                linesReference[line.idLine] = l.idLine;
                                                                nextLine();
                                                            }).catch(err => {
                                                                console.log(err);
                                                                nextLine();
                                                            });
                                                        }, function () {
                                                            cbLine(null, linesReference);
                                                        });
                                                    }, function (linesReference, cbShading) {
                                                        asyncEach(track.shadings, function (shading, nextShading) {
                                                            let newShading = shading.toJSON();
                                                            delete newShading.idShading;
                                                            delete newShading.createdAt;
                                                            delete newShading.updatedAt;
                                                            newShading.idTrack = t.idTrack;
                                                            newShading.idLeftLine = linesReference[newShading.idLeftLine];
                                                            newShading.idRightLine = linesReference[newShading.idRightLine];
                                                            newShading.idControlCurve = curvesReference[newShading.idControlCurve];
                                                            dbConnection.Shading.create(newShading).then(s => {
                                                                nextShading();
                                                            }).catch(err => {
                                                                console.log(err);
                                                                nextShading();
                                                            });
                                                        }, function () {
                                                            cbShading(null);
                                                        });
                                                    }, function (cbMarker) {
                                                        asyncEach(track.markers, function (marker, nextMarker) {
                                                            let newMarker = marker.toJSON();
                                                            delete newMarker.idMarker;
                                                            delete newMarker.createdAt;
                                                            delete newMarker.updatedAt;
                                                            newMarker.idTrack = t.idTrack;
                                                            dbConnection.Marker.create(newMarker).then(m => {
                                                                nextMarker();
                                                            }).catch(err => {
                                                                console.log(err);
                                                                nextMarker();
                                                            });
                                                        }, function () {
                                                            cbMarker();
                                                        });
                                                    }, function (cbAnnotation) {
                                                        asyncEach(track.annotations, function (annotation, nextAno) {
                                                            let newAno = annotation.toJSON();
                                                            delete newAno.idAnnotation;
                                                            delete newAno.createdAt;
                                                            delete newAno.updatedAt;
                                                            newAno.idTrack = t.idTrack;
                                                            dbConnection.Annotation.create(newAno).then(a => {
                                                                nextAno();
                                                            }).catch(err => {
                                                                console.log(err);
                                                                nextAno();
                                                            });
                                                        }, function () {
                                                            cbAnnotation();
                                                        });
                                                    }
                                                ], function () {
                                                    nextTrack();
                                                });
                                            }).catch(err => {
                                                console.log(err);
                                                nextTrack();
                                            })
                                        }, function () {
                                            callback();
                                        });
                                    });
                                }, function (callback) {
                                    //depthAxis
                                    dbConnection.DepthAxis.findAll({where: {idPlot: plot.idPlot}}).then(depths => {
                                        asyncEach(depths, function (depth, nextDepth) {
                                            let newDepthTrack = depth.toJSON();
                                            delete newDepthTrack.idDepthAxis;
                                            delete newDepthTrack.createdAt;
                                            delete newDepthTrack.updatedAt;
                                            newDepthTrack.idPlot = p.idPlot;
                                            dbConnection.DepthAxis.create(newDepthTrack).then(t => {
                                                nextDepth();
                                            }).catch(err => {
                                                console.log(err);
                                                nextDepth();
                                            });
                                        }, function () {
                                            callback();
                                        });
                                    });
                                }, function (callback) {
                                    //zoneTrack
                                    dbConnection.ZoneTrack.findAll({
                                        where: {idPlot: plot.idPlot}
                                    }).then(tracks => {
                                        asyncEach(tracks, function (track, nextTrack) {
                                            let newZoneTrack = track.toJSON();
                                            delete newZoneTrack.idZoneTrack;
                                            delete newZoneTrack.createdAt;
                                            delete newZoneTrack.updatedAt;
                                            newZoneTrack.idPlot = p.idPlot;
                                            newZoneTrack.idZoneSet = zonesetsReference[newZoneTrack.idZoneSet];
                                            dbConnection.ZoneTrack.create(newZoneTrack).then(z => {
                                                nextTrack();
                                            }).catch(err => {
                                                console.log(err);
                                                nextTrack();
                                            })
                                        }, function () {
                                            callback();
                                        });
                                    });
                                }, function (callback) {
                                    //imageTrack
                                    dbConnection.ImageTrack.findAll({
                                        where: {idPlot: plot.idPlot},
                                        include: {model: dbConnection.ImageOfTrack}
                                    }).then(tracks => {
                                        asyncEach(tracks, function (track, nextTrack) {
                                            let newImageTrack = track.toJSON();
                                            delete newImageTrack.idImageTrack;
                                            delete newImageTrack.createdAt;
                                            delete newImageTrack.updatedAt;
                                            newImageTrack.idPlot = p.idPlot;
                                            dbConnection.ImageTrack.create(newImageTrack).then(i => {
                                                asyncEach(track.image_of_tracks, function (image, nextImage) {
                                                    let newImage = image.toJSON();
                                                    delete newImage.idImageOfTrack;
                                                    delete newImage.createdAt;
                                                    delete newImage.updatedAt;
                                                    newImage.idImageTrack = i.idImageTrack;
                                                    dbConnection.ImageOfTrack.create(newImage).then(img => {
                                                        nextImage();
                                                    }).catch(err => {
                                                        console.log(err);
                                                        nextImage();
                                                    });
                                                }, function () {
                                                    nextTrack();
                                                });
                                            }).catch(err => {
                                                console.log(err);
                                                nextTrack();
                                            })
                                        }, function () {
                                            callback();
                                        });
                                    });
                                }, function (callback) {
                                    //objectTrack
                                    dbConnection.ObjectTrack.findAll({
                                        where: {idPlot: plot.idPlot},
                                        include: {model: dbConnection.ObjectOfTrack}
                                    }).then(tracks => {
                                        asyncEach(tracks, function (track, nextTrack) {
                                            let newObjectTrack = track.toJSON();
                                            delete newObjectTrack.idObjectTrack;
                                            delete newObjectTrack.createdAt;
                                            delete newObjectTrack.updatedAt;
                                            newObjectTrack.idPlot = p.idPlot;
                                            dbConnection.ObjectTrack.create(newObjectTrack).then(i => {
                                                asyncEach(track.object_of_tracks, function (obj, nextObj) {
                                                    let newObj = obj.toJSON();
                                                    delete newObj.idObjectOfTrack;
                                                    delete newObj.createdAt;
                                                    delete newObj.updatedAt;
                                                    newObj.idObjectTrack = i.idObjectTrack;
                                                    let object = JSON.parse(newObj.object);
                                                    if (object.type == 'Histogram') {
                                                        object.idHistogram = histogramsReference[object.idHistogram];
                                                    } else if (object.type == 'Crossplot') {
                                                        object.idCrossplot = crossplotsReference[object.idCrossplot];
                                                    } else {
                                                        console.log("No thing");
                                                    }
                                                    newObj.object = JSON.stringify(object);
                                                    dbConnection.ObjectOfTrack.create(newObj).then(() => {
                                                        nextObj();
                                                    }).catch(err => {
                                                        nextObj();
                                                        console.log(err);
                                                    });
                                                }, function () {
                                                    nextTrack();
                                                });
                                            }).catch(err => {
                                                console.log(err);
                                                nextTrack();
                                            });
                                        }, function () {
                                            callback();
                                        });
                                    });
                                }
                            ], function () {
                                nextPlot();
                            });
                        }).catch(err => {
                            console.log(err);
                            nextPlot();
                        })
                    }, function () {
                        console.log("Done log plots");
                        cb(null);
                    });
                },
                function (cb) {
                    asyncEach(well.wellheaders, function (wellheader, nextHeader) {
                        let newHeader = wellheader.toJSON();
                        delete newHeader.idWellHeader;
                        delete newHeader.createdAt;
                        delete newHeader.updatedAt;
                        newHeader.idWell = _well.idWell;
                        dbConnection.WellHeader.create(newHeader).then(() => {
                            nextHeader();
                        }).catch(err => {
                            console.log(err);
                            nextHeader();
                        })
                    }, function () {
                        console.log("Done well headers");
                        cb(null);
                    });
                }
            ], function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", well));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Well Found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
    });
};
