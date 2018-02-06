let asyncEach = require('async/each');
let asyncParallel = require('async/parallel');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let config = require('config');
let fsExtra = require('fs-extra');
let asyncSeries = require('async/series');

module.exports = function (idWell, done, dbConnection, username) {
    dbConnection.Well.findById(idWell, {
        include: [
            {
                model: dbConnection.Dataset,
                include: {model: dbConnection.Curve}
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
                model: dbConnection.ZoneSet,
                include: {model: dbConnection.Zone}
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
            asyncSeries([
                function (cb) {
                    asyncEach(well.datasets, function (dataset, nextDataset) {
                        dbConnection.Dataset.create({
                            name: dataset.name,
                            datasetKey: dataset.datasetKey,
                            datasetLabel: dataset.datasetLabel,
                            idWell: _well.idWell
                        }).then(_dataset => {
                            asyncEach(dataset.curves, function (curve, nextCurve) {
                                let curvePath = hashDir.createPath(config.curveBasePath, username + _project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                dbConnection.Curve.create({
                                    name: curve.name,
                                    unit: curve.unit,
                                    idDataset: _dataset.idDataset,
                                    initValue: "well-duplicated"
                                }).then(_curve => {
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
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    asyncEach(well.zonesets, function (zoneset, nextzs) {
                        let zs = zoneset.toJSON();
                        delete zs.idZoneSet;
                        delete zs.createdAt;
                        delete zs.updatedAt;
                        zs.idWell = _well.idWell;
                        dbConnection.ZoneSet.create(zs).then(rs => {
                            if (rs) {
                                asyncEach(zoneset.zones, function (zone, nextz) {
                                    let z = zone.toJSON();
                                    delete z.idZone;
                                    delete z.createdAt;
                                    delete z.updatedAt;
                                    z.idZoneSet = rs.idZoneSet;
                                    dbConnection.Zone.create(z).then(rs => {
                                        nextz();
                                    }).catch(err => {
                                        console.log(err);
                                        nextz();
                                    });
                                }, function () {
                                    nextzs();
                                });
                            } else {
                                nextzs();
                            }
                        }).catch(err => {
                            console.log(err);
                            nextzs();
                        });
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    asyncEach(well.plots, function (plot, next) {
                        let newPlot = plot.toJSON();
                        delete newPlot.idPlot;
                        delete newPlot.createdAt;
                        delete newPlot.updatedAt;
                        console.log(newPlot);
                        // dbConnection.Plot.create()
                        next();
                    }, function () {
                        cb();
                    });
                },
                function (cb) {
                    cb();
                },
                function (cb) {
                    cb();
                },
                function (cb) {
                    cb();
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
