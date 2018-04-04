"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncEach = require('async/each');
let asyncParallel = require('async/parallel');
let rename = require('../utils/function').renameObjectForDustbin;
let curveFunction = require('../utils/curve.function');


function getDustbin(payload, callback, dbConnection) {
    let Wells = [];
    let Datasets = [];
    let Curves = [];
    let Histograms = [];
    let Crossplots = [];
    let Zonesets = [];
    let Zones = [];
    let Plots = [];
    dbConnection.Well.findAll({
        where: {
            idProject: payload.idProject
        }, paranoid: false
    }).then(wells => {
        asyncEach(wells, function (well, nextWell) {
            if (well.deletedAt) {
                let _well = well.toJSON();
                _well.name = _well.name.substring(1);
                Wells.push(_well);
            }
            asyncParallel([
                function (cb) {
                    dbConnection.Dataset.findAll({where: {idWell: well.idWell}, paranoid: false}).then(datasets => {
                        asyncEach(datasets, function (dataset, nextDataset) {
                            if (dataset.deletedAt) {
                                let _dataset = dataset.toJSON();
                                _dataset.name = _dataset.name.substring(1);
                                Datasets.push(_dataset);
                            }
                            dbConnection.Curve.findAll({
                                where: {idDataset: dataset.idDataset},
                                paranoid: false
                            }).then(curves => {
                                asyncEach(curves, function (curve, nextCurve) {
                                    if (curve.deletedAt) {
                                        let _curve = curve.toJSON();
                                        _curve.name = _curve.name.substring(1);
                                        Curves.push(_curve);
                                    }
                                    nextCurve();
                                }, function () {
                                    nextDataset();
                                });
                            });
                        }, function () {
                            cb();
                        });
                    });
                },
                function (cb) {
                    dbConnection.Plot.findAll({where: {idWell: well.idWell}, paranoid: false}).then(plots => {
                        asyncEach(plots, function (plot, nextPlot) {
                            if (plot.deletedAt) {
                                let _plot = plot.toJSON();
                                _plot.name = _plot.name.substring(1);
                                Plots.push(_plot);
                            }
                            nextPlot();
                        }, function () {
                            cb();
                        });
                    });
                },
                function (cb) {
                    dbConnection.Histogram.findAll({where: {idWell: well.idWell}, paranoid: false}).then(histograms => {
                        asyncEach(histograms, function (histogram, nextHistogram) {
                            if (histogram.deletedAt) {
                                let _histogram = histogram.toJSON();
                                _histogram.name = _histogram.name.substring(1);
                                Histograms.push(_histogram);
                            }
                            nextHistogram();
                        }, function () {
                            cb();
                        });
                    });
                },
                function (cb) {
                    dbConnection.CrossPlot.findAll({where: {idWell: well.idWell}, paranoid: false}).then(crossplots => {
                        asyncEach(crossplots, function (crossplot, nextCrossplot) {
                            if (crossplot.deletedAt) {
                                let _crossplot = crossplot.toJSON();
                                _crossplot.name = _crossplot.name.substring(1);
                                Crossplots.push(_crossplot);
                            }
                            nextCrossplot();
                        }, function () {
                            cb();
                        });
                    });
                },
                function (cb) {
                    dbConnection.ZoneSet.findAll({where: {idWell: well.idWell}, paranoid: false}).then(zonesets => {
                        asyncEach(zonesets, function (zoneset, nextZoneset) {
                            if (zoneset.deletedAt) {
                                let _zoneset = zoneset.toJSON();
                                _zoneset.name = _zoneset.name.substring(1);
                                Zonesets.push(_zoneset);
                            }
                            dbConnection.Zone.findAll({
                                where: {idZoneSet: zoneset.idZoneSet},
                                paranoid: false
                            }).then(zones => {
                                asyncEach(zones, function (zone, nextZone) {
                                    if (zone.deletedAt) {
                                        let _zone = zone.toJSON();
                                        _zone.name = _zone.name.substring(1);
                                        Zones.push(_zone);
                                    }
                                    nextZone();
                                }, function () {
                                    nextZoneset();
                                });
                            })
                        }, function () {
                            cb();
                        });
                    });
                }
            ], function () {
                nextWell();
            });
        }, function () {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", {
                crossplots: Crossplots,
                wells: Wells,
                datasets: Datasets,
                curves: Curves,
                zonesets: Zonesets,
                zones: Zones,
                histograms: Histograms,
                plots: Plots
            }))
        });
    });
}

function deleteObject(payload, callback, dbConnection) {
    let Well = dbConnection.Well;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Plot = dbConnection.Plot;
    let CrossPlot = dbConnection.CrossPlot;
    let Histogram = dbConnection.Histogram;
    let ZoneSet = dbConnection.ZoneSet;
    let Zone = dbConnection.Zone;
    //type = well,group,dataset,curve,plot,crossplot,histogram,zoneset
    let objectType = payload.type;
    switch (objectType) {
        case 'well' : {
            Well.findById(payload.idObject, {paranoid: false}).then(rs => {
                rs.destroy({force: true}).then(() => {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
                });
            });
            break;
        }
        case 'dataset' : {
            Dataset.findById(payload.idObject, {paranoid: false}).then(rs => {
                rs.destroy({force: true}).then(() => {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
                });
            });
            break;
        }
        case 'curve' : {
            Curve.findById(payload.idObject, {paranoid: false}).then(curve => {
                curve.destroy({force: true}).then(() => {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
                });
            });
            break;
        }
        case 'logplot' : {
            Plot.destroy({
                where: {idPlot: payload.idObject},
                force: true
            }).then(rs => {
                if (rs != 0) {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                } else {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "CANT_DELETE"));
                }
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
            });
            break;
        }
        case 'crossplot' : {
            CrossPlot.destroy({
                where: {idCrossPlot: payload.idObject},
                force: true
            }).then(rs => {
                if (rs != 0) {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                } else {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "CANT_DELETE"));
                }
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
            });
            break;
        }
        case 'histogram' : {
            Histogram.destroy({
                where: {idHistogram: payload.idObject},
                force: true
            }).then(rs => {
                if (rs != 0) {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                } else {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_DELETE"));
                }
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
            });
            break;
        }
        case 'zoneset' : {
            ZoneSet.destroy({
                where: {idZoneSet: payload.idObject},
                force: true
            }).then(rs => {
                if (rs != 0) {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                } else {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "CANT_DELETE"));
                }
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
            })
            break;
        }
        case 'zone' : {
            Zone.destroy({
                where: {idZone: payload.idObject},
                force: true
            }).then(rs => {
                if (rs != 0) {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                } else {
                    callback(ResponseJSON(ErrorCodes.SUCCESS, "CANT_DELETE"));
                }
            }).catch(err => {
                callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
            })
            break;
        }
        default: {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "WRONG_TYPE"));
            break;
        }
    }

}

function restoreObject(payload, callback, dbConnection, username) {
    let Well = dbConnection.Well;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Plot = dbConnection.Plot;
    let CrossPlot = dbConnection.CrossPlot;
    let Histogram = dbConnection.Histogram;
    let ZoneSet = dbConnection.ZoneSet;
    let objectType = payload.type;
    let Zone = dbConnection.Zone;
    switch (objectType) {
        case 'well': {
            Well.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                let oldName = rs.name;
                rs.name = rs.name.substring(1);
                rename(rs, function (err, success) {
                    if (!err) {
                        rs.restore().then(() => {
                            Dataset.findAll({where: {idWell: rs.idWell}}).then(datasets => {
                                asyncEach(datasets, function (dataset, nextDataset) {
                                    Curve.findAll({where: {idDataset: dataset.idDataset}}).then(curves => {
                                        asyncEach(curves, function (curve, nextCurve) {
                                            curveFunction.getFullCurveParents(curve, dbConnection).then(curveParents => {
                                                curveParents.username = username;
                                                let srcCurve = {
                                                    username: curveParents.username,
                                                    project: curveParents.project,
                                                    well: oldName,
                                                    dataset: curveParents.dataset,
                                                    curve: curveParents.curve
                                                };
                                                curveFunction.moveCurveData(srcCurve, curveParents, function () {
                                                    nextCurve();
                                                });
                                            });
                                        }, function () {
                                            nextDataset();
                                        });
                                    })
                                }, function () {
                                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", success));
                                });
                            });
                        });
                    } else {
                        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                }, 'restore');
            });
            break;
        }
        case 'dataset': {
            Dataset.findById(payload.idObject, {
                paranoid: false,
                include: {all: true, paranoid: false}
            }).then(rs => {
                let oldName = rs.name;
                rs.name = rs.name.substring(1);
                rename(rs, function (err, r) {
                    if (!err) {
                        rs.restore().then(() => {
                            asyncEach(rs.curves, function (curve, nextCurve) {
                                curveFunction.getFullCurveParents(curve, dbConnection).then(function (curveParents) {
                                    curveParents.username = username;
                                    let srcCurve = {
                                        username: curveParents.username,
                                        project: curveParents.project,
                                        well: curveParents.well,
                                        dataset: oldName,
                                        curve: curveParents.curve
                                    };
                                    curveFunction.moveCurveData(srcCurve, curveParents, function () {
                                        curve.restore().then(() => {
                                            dbConnection.Line.findAll({
                                                where: {idCurve: curve.idCurve},
                                                paranoid: false
                                            }).then(lines => {
                                                asyncEach(lines, function (line, next) {
                                                    line.restore().then(() => {
                                                        next();
                                                    });
                                                }, function () {
                                                    nextCurve();
                                                });
                                            });
                                        });
                                    });
                                });
                            }, function () {
                                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                            });
                        });
                    } else {
                        console.log(err);
                    }
                }, 'restore');
            });
            break;
        }
        case 'curve': {
            Curve.findById(payload.idObject, {
                paranoid: false
            }).then(async rs => {
                let curveParents = await curveFunction.getFullCurveParents(rs, dbConnection);
                curveParents.username = username;
                rs.name = rs.name.substring(1);
                rename(rs, function (err, r) {
                    rs.restore().then(() => {
                        let desCurve = {
                            username: curveParents.username,
                            project: curveParents.project,
                            well: curveParents.well,
                            dataset: curveParents.dataset,
                            curve: r.name
                        };
                        curveFunction.moveCurveData(curveParents, desCurve, function () {
                            dbConnection.Line.findAll({where: {idCurve: rs.idCurve}, paranoid: false}).then(lines => {
                                asyncEach(lines, function (line, next) {
                                    line.restore().then(() => {
                                        next();
                                    })
                                }, function () {
                                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                                });
                            })
                        });
                    });
                }, 'restore');
            });
            break;
        }
        case 'logplot': {
            Plot.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(1);
                rename(rs, function (err, success) {
                    if (!err) {
                        rs.restore().then(() => {
                            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", success));
                        });
                    } else {
                        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                }, 'restore');
            });
            break;
        }
        case 'histogram': {
            Histogram.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(1);
                rename(rs, function (err, success) {
                    if (!err) {
                        rs.restore().then(() => {
                            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", success));
                        });
                    } else {
                        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                }, 'restore');
            });
            break;
        }
        case 'crossplot': {
            CrossPlot.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(1);
                rename(rs, function (err, success) {
                    if (!err) {
                        rs.restore().then(() => {
                            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", success));
                        });
                    } else {
                        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                }, 'restore');
            });
            break;
        }
        case 'zoneset': {
            ZoneSet.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(1);
                rename(rs, function (err, success) {
                    if (!err) {
                        rs.restore().then(() => {
                            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", success));
                        });
                    } else {
                        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                }, 'restore');
            });
            break;
        }
        case 'zone' : {
            Zone.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(1);
                rename(rs, function (err, success) {
                    if (!err) {
                        rs.restore().then(() => {
                            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", success));
                        });
                    } else {
                        callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                }, 'restore');
            });
            break;
        }
        default: {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "WRONG_TYPE"));
            break;
        }
    }
}

module.exports = {
    getDustbin: getDustbin,
    deleteObject: deleteObject,
    restoreObject: restoreObject
}