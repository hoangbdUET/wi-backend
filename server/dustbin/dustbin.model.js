"use strict";
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
let asyncEach = require('async/each');
let asyncSeries = require('async/series');

function getDustbin(payload, callback, dbConnection) {
    let Project = dbConnection.Project;
    let response = new Object();
    Project.findById(payload.idProject, {
        include: [{
            model: dbConnection.Well,
            paranoid: false,
            include: [{
                model: dbConnection.Dataset,
                include: [{
                    model: dbConnection.Curve,
                    paranoid: false,
                    include: [{
                        model: dbConnection.Family,
                        as: "LineProperty"
                    }]
                }]
            }, {
                model: dbConnection.Plot,
                paranoid: false,
            }, {
                model: dbConnection.CrossPlot,
                paranoid: false,
            }, {
                model: dbConnection.Histogram,
                paranoid: false,
            }, {
                model: dbConnection.CombinedBox,
                paranoid: false,
            }]
        }, {
            model: dbConnection.Groups,
            paranoid: false,
        }]
    }).then(project => {
        response = project.toJSON();
        asyncEach(response.wells, function (well, next) {
            dbConnection.ZoneSet.findAll({
                where: {idWell: well.idWell},
                include: {model: dbConnection.Zone},
                paranoid: false,
            }).then(zs => {
                zs = JSON.parse(JSON.stringify(zs));
                response.wells[response.wells.indexOf(well)].zonesets = zs;
                next();
            });
        }, function () {
            let Well = new Array();
            let Dataset = new Array()
            let Curve = new Array();
            let Plot = new Array();
            let Histogram = new Array();
            let CrossPlot = new Array();
            // let ZoneSet = new Array();
            // let Group = new Array();
            asyncEach(response.wells, function (well, next) {
                if (well.deletedAt) {
                    console.log("Pushed well : ", well.name);
                    well.name = well.name.substring(14);
                    Well.push(well);
                } else {
                    asyncEach(well.datasets, function (dataset, next) {
                        if (dataset.deletedAt) {
                            console.log("Pushed dataset : ", dataset.name);
                            dataset.name = dataset.name.substring(14);
                            Dataset.push(dataset);
                        } else {
                            asyncEach(dataset.curves, function (curve, next) {
                                if (curve.deletedAt) {
                                    Curve.push(curve);
                                }
                                next();
                            });
                        }
                        next();
                    }, function () {
                        asyncEach(well.plots, function (plot, next) {
                            if (plot.deletedAt) {
                                plot.name = plot.name.substring(14);
                                Plot.push(plot);
                            }
                            next();
                        }, function () {
                            asyncEach(well.histograms, function (histogram, next) {
                                if (histogram.deletedAt) {
                                    histogram.name = histogram.name.substring(14);
                                    Histogram.push(histogram);
                                }
                                next();
                            }, function () {
                                asyncEach(well.crossplots, function (crossplot, next) {
                                    if (crossplot.deletedAt) {
                                        crossplot.name = crossplot.name.substring(14);
                                        CrossPlot.push(crossplot);
                                    }
                                    next();
                                }, function () {
                                    // asyncEach(well.zonesets, function (zoneset, next) {
                                    //     if (zoneset.deletedAt) {
                                    //         zoneset.name = zoneset.name.substring(14);
                                    //         ZoneSet.push(zoneset);
                                    //     }
                                    //     next();
                                    // })
                                })
                            })
                        });
                    });
                }
                next();
            }, function () {
                console.log("finished");
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", {
                    wells: Well,
                    datasets: Dataset,
                    curves: Curve,
                    plots: Plot,
                    crossplots: CrossPlot,
                    histograms: Histogram,
                    // zonsets: ZoneSet,
                    // groups: Group
                }));
            });
        });
    });
    // Project.findById(payload.idProject, {
    //     paranoid: false,
    //     include: [{
    //         model: dbConnection.Well,
    //         paranoid: false,
    //         include: [{
    //             model: dbConnection.Dataset,
    //             paranoid: false,
    //             include: [{
    //                 paranoid: false,
    //                 model: dbConnection.Curve,
    //                 include: {
    //                     model: dbConnection.Family,
    //                     as: "LineProperty"
    //                 }
    //             }]
    //         }, {
    //             paranoid: false,
    //             model: dbConnection.Plot
    //         }, {
    //             paranoid: false,
    //             model: dbConnection.CrossPlot
    //         }, {
    //             paranoid: false,
    //             model: dbConnection.Histogram
    //         }, {
    //             paranoid: false,
    //             model: dbConnection.ZoneSet,
    //             include: [{
    //                 paranoid: false,
    //                 model: dbConnection.Zone
    //             }]
    //         }]
    //     }, {
    //         paranoid: false,
    //         model: dbConnection.Groups
    //     }]
    // }).then(rs => {
    //     let Well = new Array();
    //     let Dataset = new Array()
    //     let Curve = new Array();
    //     let Plot = new Array();
    //     let Histogram = new Array();
    //     let CrossPlot = new Array();
    //     // let ZoneSet = new Array();
    //     // let Group = new Array();
    //     asyncEach(rs.wells, function (well, next) {
    //         if (well.deletedAt) {
    //             console.log("Pushed well : ", well.name);
    //             well.name = well.name.substring(14);
    //             Well.push(well);
    //         } else {
    //             asyncEach(well.datasets, function (dataset, next) {
    //                 if (dataset.deletedAt) {
    //                     console.log("Pushed dataset : ", dataset.name);
    //                     dataset.name = dataset.name.substring(14);
    //                     Dataset.push(dataset);
    //                 } else {
    //                     asyncEach(dataset.curves, function (curve, next) {
    //                         if (curve.deletedAt) {
    //                             Curve.push(curve);
    //                         }
    //                         next();
    //                     });
    //                 }
    //                 next();
    //             }, function () {
    //                 asyncEach(well.plots, function (plot, next) {
    //                     if (plot.deletedAt) {
    //                         plot.name = plot.name.substring(14);
    //                         Plot.push(plot);
    //                     }
    //                     next();
    //                 }, function () {
    //                     asyncEach(well.histograms, function (histogram, next) {
    //                         if (histogram.deletedAt) {
    //                             histogram.name = histogram.name.substring(14);
    //                             Histogram.push(histogram);
    //                         }
    //                         next();
    //                     }, function () {
    //                         asyncEach(well.crossplots, function (crossplot, next) {
    //                             if (crossplot.deletedAt) {
    //                                 crossplot.name = crossplot.name.substring(14);
    //                                 CrossPlot.push(crossplot);
    //                             }
    //                             next();
    //                         }, function () {
    //                             // asyncEach(well.zonesets, function (zoneset, next) {
    //                             //     if (zoneset.deletedAt) {
    //                             //         zoneset.name = zoneset.name.substring(14);
    //                             //         ZoneSet.push(zoneset);
    //                             //     }
    //                             //     next();
    //                             // })
    //                         })
    //                     })
    //                 });
    //             });
    //         }
    //         next();
    //     }, function () {
    //         console.log("finished");
    //         callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", {
    //             wells: Well,
    //             datasets: Dataset,
    //             curves: Curve,
    //             plots: Plot,
    //             crossplots: CrossPlot,
    //             histograms: Histogram,
    //             // zonsets: ZoneSet,
    //             // groups: Group
    //         }));
    //     });
    // }).catch(err => {
    //     console.log(err);
    // })
}

function deleteObject(payload, callback, dbConnection) {
    let Well = dbConnection.Well;
    let Group = dbConnection.Group;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Plot = dbConnection.Plot;
    let CrossPlot = dbConnection.CrossPlot;
    let Histogram = dbConnection.Histogram;
    let ZoneSet = dbConnection.ZoneSet;
    //type = well,group,dataset,curve,plot,crossplot,histogram,zoneset
    let objectType = payload.type;
    switch (objectType) {
        case 'well' : {
            Well.destroy({
                where: {idWell: payload.idObject},
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
        case 'dataset' : {
            Dataset.destroy({
                where: {idDataset: payload.idObject},
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
        case 'curve' : {
            Curve.destroy({
                where: {idCurve: payload.idObject},
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
            })
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
            })
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
            })
            break;
        }
        // case 'zoneset' : {
        //     ZoneSet.destroy({
        //         where: {idZoneSet: payload.idObject},
        //         force: true
        //     }).then(rs => {
        //         if (rs != 0) {
        //             callback(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
        //         } else {
        //             callback(ResponseJSON(ErrorCodes.SUCCESS, "CANT_DELETE"));
        //         }
        //     }).catch(err => {
        //         callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Err", err.message));
        //     })
        //     break;
        // }
        default: {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "WRONG_TYPE"));
            break;
        }
    }

}

function restoreObject(payload, callback, dbConnection) {
    let Well = dbConnection.Well;
    let Group = dbConnection.Group;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Plot = dbConnection.Plot;
    let CrossPlot = dbConnection.CrossPlot;
    let Histogram = dbConnection.Histogram;
    let ZoneSet = dbConnection.ZoneSet;
    let objectType = payload.type;
    switch (objectType) {
        case 'well': {
            Well.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(14);
                rs.save().then(r => {
                    rs.restore().then(() => {
                        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                    });
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
                })
            });
            break;
        }
        case 'dataset': {
            Dataset.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(14);
                rs.save().then(r => {
                    rs.restore().then(() => {
                        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                    });
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
                })
            });
            break;
        }
        case 'curve': {
            Curve.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.save().then(r => {
                    rs.restore().then(() => {
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
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
                })
            });
            break;
        }
        case 'logplot': {
            Plot.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(14);
                rs.save().then(r => {
                    rs.restore().then(() => {
                        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                    });
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
                })
            });
            break;
        }
        case 'histogram': {
            Histogram.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(14);
                rs.save().then(r => {
                    rs.restore().then(() => {
                        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                    });
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
                })
            });
            break;
        }
        case 'crossplot': {
            CrossPlot.findById(payload.idObject, {
                paranoid: false
            }).then(rs => {
                rs.name = rs.name.substring(14);
                rs.save().then(r => {
                    rs.restore().then(() => {
                        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
                    });
                }).catch(err => {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
                })
            });
            break;
        }
        // case 'zoneset': {
        //     ZoneSet.findById(payload.idObject, {
        //         paranoid: false
        //     }).then(rs => {
        //         rs.name = rs.name.substring(14);
        //         rs.save().then(r => {
        //             rs.restore().then(() => {
        //                 callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", r));
        //             });
        //         }).catch(err => {
        //             callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "CANT_RESTORE", err.message));
        //         })
        //     });
        //     break;
        // }
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