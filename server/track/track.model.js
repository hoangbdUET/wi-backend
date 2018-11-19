let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let fs = require('fs');
let asyncLoop = require('async/each');
let asyncSeries = require('async/series');
let path = require('path');
let async = require('async');

function createNewTrack(trackInfo, done, dbConnection) {
    dbConnection.Track.create(trackInfo).then(track => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Track success", track));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, err.message, err.message));
    });
}

function editTrack(trackInfo, done, dbConnection) {
    delete trackInfo.createdBy;
    let Track = dbConnection.Track;
    Track.findById(trackInfo.idTrack)
        .then(function (track) {
            Object.assign(track, trackInfo).save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit track success", trackInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for edit"))
        });
}

function deleteTrack(trackInfo, done, dbConnection) {
    let Track = dbConnection.Track;
    Track.findById(trackInfo.idTrack)
        .then(function (track) {
            track.setDataValue('updatedBy', trackInfo.updatedBy);
            track.destroy({hooks: !dbConnection.hookPerm})
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Track is deleted", track));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for delete"));
        })
}

function getTrackInfo(track, done, dbConnection) {
    let Track = dbConnection.Track;
    Track.findById(track.idTrack, {
        include: [
            {model: dbConnection.Line},
            {model: dbConnection.Shading},
            {model: dbConnection.Annotation},
            {
                model: dbConnection.MarkerSet,
                include: {model: dbConnection.Marker, include: {model: dbConnection.MarkerTemplate}}
            },
            {
                model: dbConnection.ZoneSet,
                include: {model: dbConnection.Zone, include: {model: dbConnection.ZoneTemplate}}
            }
        ]
    })
        .then(function (track) {
            if (!track) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Track success", track));
        })
        .catch(function (err) {
            console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for get info", err));
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
            model: dbConnection.MarkerSet
        }, {
            model: dbConnection.ZoneSet
        }, {
            model: dbConnection.Annotation
        }]
    }).then(async track => {
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
    }).catch(err => {
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
        idPlot: myTrack.idPlot,
        zoomFactor: myTrack.zoomFactor,
        widthUnit: myTrack.widthUnit,
        createdBy: myTrack.createdBy,
        updatedBy: myTrack.updatedBy
    }).then(track => {
        callback(track.idTrack);
    }).catch(err => {
        console.log(err);
        callback(null);
    })
};
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
};
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
        idTrack: lineInfo.idTrack,
        orderNum: lineInfo.orderNum,
        createdBy: lineInfo.createdBy,
        updatedBy: lineInfo.updatedBy
    }).then(line => {
        callback(line.idLine);
    }).catch(err => {
        console.log(err);
        callback(null);
    })
};
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
};
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
        idControlCurve: shadingInfo.idControlCurve,
        createdBy: shadingInfo.createdBy,
        updatedBy: shadingInfo.updatedBy
    }).then(shading => {
        callback(shading.idShading);
    }).catch(err => {
        console.log(err);
        callback(null);
    });
};

//thieu marker
let importTrackTemplate = async function (req, done, dbConnection) {
    console.log(req.createdBy, req.updatedBy, req.body.createdBy, req.body.updatedBy)
    let filePath = path.join(__dirname + '/../..', req.file.path);
    let list = req.file.filename.split('.');
    let fileType = list[list.length - 1];
    if (fileType != 'track') {
        fs.unlink(filePath);
        return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Only .track files allowed!"));
    }
    let well = await dbConnection.Well.findById(req.body.idWell);
    let isCurveNotFound = false;
    let curveHasError = new Array();
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
        } else {
            let myTrack = JSON.parse(data);
            myTrack.idPlot = req.body.idPlot;
            myTrack.createdBy = req.createdBy;
            myTrack.updatedBy = req.updatedBy;
            //fix tam controlcurve
            let idControlCurve = null;
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
                                line.createdBy = req.createdBy;
                                line.updatedBy = req.updatedBy;
                                idControlCurve = idCurve;
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
                            shading.idControlCurve = idControlCurve;
                            shading.idTrack = idTrack;
                            shading.createdBy = req.createdBy;
                            shading.updatedBy = req.updatedBy;
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
                                marker.createdBy = req.createdBy;
                                marker.updatedBy = req.updatedBy;
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
                                    image.createdBy = req.createdBy;
                                    image.updatedBy = req.updatedBy;
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
                                        let wiFunctions = require('../utils/function');
                                        wiFunctions.getWellTopDepth(well.idWell, dbConnection).then(topDepth => {
                                            wiFunctions.getWellBottomDepth(well.idWell, dbConnection).then(bottomDepth => {
                                                if (annotation.top <= parseFloat(topDepth)) annotation.top = topDepth;
                                                if (annotation.bottom >= parseFloat(bottomDepth)) annotation.bottom = bottomDepth;
                                                dbConnection.Annotation.create(annotation).then(() => {
                                                    next();
                                                }).catch(() => {
                                                    next();
                                                });
                                            });
                                        });
                                    }, function (err) {
                                        console.log("ALL ANNOTATION DONE");
                                        dbConnection.Track.findById(idTrack, {include: [{all: true}]}).then(aTrack => {
                                            if (isCurveNotFound) {
                                                let track = aTrack.toJSON();
                                                track.errorCurve = curveHasError;
                                                done(ResponseJSON(ErrorCodes.SUCCESS, "CURVE_NOT_FOUND", track));
                                            } else {
                                                console.log("DONE TRACK");
                                                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", aTrack));
                                            }
                                            fs.unlinkSync(filePath);
                                        }).catch(err => {
                                            fs.unlinkSync(filePath);
                                            console.log("ERR TRACK  : ", err);
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

let duplicateTrack = function (payload, done, dbConnection) {
    dbConnection.Track.findById(payload.idTrack.idTrack, {include: {all: true}}).then(rs => {
            let track = rs.toJSON();
            delete track.idTrack;
            delete track.createdAt;
            delete track.updatedAt;
            track.updatedBy = payload.updatedBy;
            track.orderNum = payload.idTrack.orderNum;
            dbConnection.Track.create(track).then(rs => {
                let idTrack = rs.idTrack;
                let change = new Array();
                asyncSeries([
                    function (cb) {
                        asyncLoop(track.lines, function (line, next) {
                            let myObj = {};
                            myObj.oldLine = line.idLine;
                            delete line.idLine;
                            delete line.createdAt;
                            delete line.updatedAt;
                            line.updatedBy = payload.updatedBy;
                            line.idTrack = idTrack;
                            dbConnection.Line.create(line).then(l => {
                                myObj.newLine = l.idLine;
                                change.push(myObj);
                                next();
                            }).catch(err => {
                                console.log(err);
                                next();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    },
                    function (cb) {
                        asyncLoop(track.annotations, function (annotation, next) {
                            delete annotation.idAnnotation;
                            delete annotation.createdAt;
                            delete annotation.updatedAt;
                            annotation.idTrack = idTrack;
                            annotation.updatedBy = payload.updatedBy;
                            dbConnection.Annotation.create(annotation).then(l => {
                                next();
                            }).catch(err => {
                                console.log(err);
                                next();
                            });
                        }, function () {
                            cb(null, true);
                        });
                    }
                ], function (err, result) {
                    asyncLoop(track.shadings, function (shading, next) {
                        delete shading.idShading;
                        delete shading.createdAt;
                        delete shading.updatedAt;
                        shading.idTrack = idTrack;
                        shading.updatedBy = payload.updatedBy;
                        asyncSeries([
                            function (cb) {
                                if (shading.idLeftLine) {
                                    shading.idLeftLine = change.filter(c => c.oldLine === shading.idLeftLine).map(c => c.newLine);
                                    console.log(shading.idLeftLine);
                                    cb();
                                } else {
                                    cb();
                                }
                            },
                            function (cb) {
                                if (shading.idRightLine) {
                                    shading.idRightLine = change.filter(c => c.oldLine === shading.idRightLine).map(c => c.newLine);
                                    console.log(shading.idRightLine);
                                    cb();
                                } else {
                                    cb();
                                }
                            }
                        ], function () {
                            dbConnection.Shading.create(shading).then(() => {
                                next();
                            }).catch(err => {
                                console.log(err);
                                next();
                            });
                        });
                    }, function () {
                        dbConnection.Track.findById(idTrack, {include: {all: true}}).then(t => {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", t));
                        });
                    });
                });
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        }
    ).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
};

async function applyToWell(payload, dbConnection) {
    function createLines(lines, well, _track) {
        let _lines = [];
        return new Promise((resolve => {
            async.each(lines, (line, next) => {
                delete line.idLine;
                line.idTrack = _track.idTrack;
                checkCurveIsExistedInWell(well, line.curve.name).then(curve => {
                    if (curve) {
                        line.idCurve = curve.idCurve;
                        dbConnection.Line.create(line).then((l) => {
                            _lines.push(l);
                            next();
                        }).catch(err => {
                            console.log(err);
                            next();
                        });
                    } else {
                        next();
                    }
                });
            }, () => {
                resolve(_lines);
            });
        }));
    }

    // function createAnnotations(annotations, _track) {
    //     return new Promise(resolve => {
    //         async.each(annotations, (annotation, next) => {
    //             delete annotation.idAnnotation;
    //             annotation.idTrack = _track.idTrack;
    //             dbConnection.Annotation.create(annotation).then(() => {
    //                 next();
    //             });
    //         }, function () {
    //             resolve();
    //         })
    //     });
    // }

    function createShadings(shadings, well, lines, _track) {
        return new Promise(resolve => {
            async.each(shadings, function (shading, next) {
                delete shading.idShading;
                delete shading.idControlCurve;
                shading.idTrack = _track.idTrack;
                let leftLine = shading.leftLine ? lines.find(l => l.alias === shading.leftLine.alias) : null;
                let rightLine = shading.rightLine ? lines.find(l => l.alias === shading.rightLine.alias) : null;
                shading.idLeftLine = leftLine ? leftLine.idLine : null;
                shading.idRightLine = rightLine ? rightLine.idLine : null;
                checkCurveIsExistedInWell(well, shading.curve.name).then(curve => {
                    if (curve) {
                        shading.idControlCurve = curve.idCurve;
                    }
                    if (shading.idLeftLine || shading.idRightLine) {
                        dbConnection.Shading.create(shading).then(() => {
                            next();
                        }).catch(err => {
                            console.log(err);
                            next();
                        });
                    } else {
                        next();
                    }
                });
            }, function () {
                resolve();
            })
        });
    }

    try {
        let track = await dbConnection.Track.findById(payload.idTrack, {
            include: [
                {model: dbConnection.Line, include: {model: dbConnection.Curve}},
                {
                    model: dbConnection.Shading,
                    include: [{model: dbConnection.Line, as: 'leftLine'}, {
                        model: dbConnection.Line,
                        as: 'rightLine'
                    }, {model: dbConnection.Curve}]
                },
                {model: dbConnection.Annotation},
                {model: dbConnection.ZoneSet},
                {model: dbConnection.MarkerSet}
            ]
        });
        let well = await dbConnection.Well.findById(payload.idWell, {
            include: [
                {model: dbConnection.Dataset, include: {model: dbConnection.Curve}},
                {model: dbConnection.MarkerSet},
                {model: dbConnection.ZoneSet},
            ]
        });
        if (!track) throw new Error("No Track found by id");
        if (!well) throw new Error("No Well found by id");
        track = track.toJSON();
        delete track.idTrack;
        well = well.toJSON();
        let foundZoneSetInNewWell = track.zone_set ? well.zone_sets.find(zs => zs.name === track.zone_set.name) : null;
        let foundMarkerSetInNewWell = track.marker_set ? well.marker_sets.find(ms => ms.name === track.marker_set.name) : null;
        track.idZoneSet = foundZoneSetInNewWell ? foundZoneSetInNewWell.idZoneSet : null;
        track.idMarkerSet = foundMarkerSetInNewWell ? foundMarkerSetInNewWell.idMarkerSet : null;
        track.orderNum = payload.orderNum;
        // track.title = "Created from " + track.title;
        let _track = await dbConnection.Track.create(track);
        let _lines = await createLines(track.lines, well, _track);
        // await createAnnotations(track.annotations, _track);
        await createShadings(track.shadings, well, _lines, _track);
        return ResponseJSON(ErrorCodes.SUCCESS, "Done", _track);
    } catch (err) {
        return ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err);
    }
}

function checkCurveIsExistedInWell(well, curveName) {
    return new Promise(function (resolve) {
        let curve;
        async.each(well.datasets, (d, next) => {
            let foundCurve = d.curves.find(c => c.name.trim() == curveName.trim());
            if (foundCurve) curve = foundCurve;
            next();
        }, function () {
            resolve(curve);
        });
    });
}

module.exports = {
    createNewTrack: createNewTrack,
    deleteTrack: deleteTrack,
    editTrack: editTrack,
    getTrackInfo: getTrackInfo,
    exportData: exportData,
    importTrackTemplate: importTrackTemplate,
    duplicateTrack: duplicateTrack,
    applyToWell: applyToWell
};
