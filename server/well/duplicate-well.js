let asyncEach = require('async/each');
let asyncParallel = require('async/parallel');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let config = require('config');
let fsExtra = require('fs-extra');
let asyncWaterfall = require('async/waterfall');


module.exports = function (idWell, done, dbConnection, username, createdBy, updatedBy) {
    dbConnection.Well.findById(idWell, {
        include: [
            {model: dbConnection.Dataset, include: [{model: dbConnection.Curve}, {model: dbConnection.DatasetParams}]},
            {model: dbConnection.WellHeader}
        ]
    }).then(async well => {
        let newWell = {};
        if (well) {
            newWell = well.toJSON();
            delete newWell.createdAt;
            delete newWell.updatedAt;
            delete newWell.deletedAt;
            delete newWell.idWell;
            newWell.duplicated = 1;
            newWell.name = newWell.name + "_Copy_" + well.duplicated;
            newWell.createdBy = createdBy;
            newWell.updatedBy = updatedBy;
            newWell.topDepth = well.topDepth;
            newWell.bottomDepth = well.bottomDepth;
            newWell.step = well.step;
            newWell.unit = well.unit;
            well.duplicated++;
            await well.save();
            let _well = await dbConnection.Well.create(newWell);
            let _project = await dbConnection.Project.findById(newWell.idProject);
            asyncParallel([
                function (callback) {
                    asyncEach(well.well_headers, function (wellHeader, next) {
                        dbConnection.WellHeader.findOrCreate({
                            where: {
                                idWell: _well.idWell,
                                header: wellHeader.header
                            },
                            defaults: {
                                idWell: _well.idWell,
                                header: wellHeader.header,
                                value: wellHeader.value,
                                unit: wellHeader.unit,
                                description: wellHeader.description,
                                standard: wellHeader.standard,
                                createdBy: createdBy,
                                updatedBy: updatedBy,
                            }
                        }).then((rs) => {
                            if (rs[1]) {
                                next();
                            } else {
                                rs[0].value = wellHeader.value;
                                rs[0].unit = wellHeader.unit;
                                rs[0].description = wellHeader.description;
                                rs[0].save().then(() => {
                                    next()
                                }).catch(err => {
                                    console.log(err);
                                    next()
                                });
                            }
                        }).catch((err) => {
                            console.log("Duplicate well - wellHeaders error ", err);
                            next();
                        })
                    }, function () {
                        callback();
                    });
                },
                function (callback) {
                    asyncEach(well.datasets, function (dataset, nextDataset) {
                        dbConnection.Dataset.create({
                            name: dataset.name,
                            idWell: _well.idWell,
                            datasetKey: dataset.datasetKey,
                            datasetLabel: dataset.datasetLabel,
                            step: dataset.step,
                            top: dataset.top,
                            bottom: dataset.bottom,
                            unit: dataset.unit,
                            duplicated: dataset.duplicated,
                            createdBy: createdBy,
                            updatedBy: updatedBy
                        }).then(_dataset => {
                            asyncEach(dataset.dataset_params, function (dataset_param, nextDatasetParam) {
                                dbConnection.DatasetParams.create({
                                    mnem: dataset_param.mnem,
                                    value: dataset_param.value,
                                    unit: dataset_param.unit,
                                    description: dataset_param.description,
                                    idDataset: _dataset.idDataset
                                }).then(() => {
                                    nextDatasetParam();
                                }).catch(err => {
                                    console.log(err);
                                    nextDatasetParam();
                                });
                            }, function () {
                                asyncEach(dataset.curves, function (curve, nextCurve) {
                                    let curvePath = hashDir.createPath(config.curveBasePath, username + _project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
                                    dbConnection.Curve.create({
                                        name: curve.name,
                                        unit: curve.unit,
                                        idDataset: _dataset.idDataset,
                                        initValue: "well-duplicated",
                                        createdBy: createdBy,
                                        updatedBy: updatedBy
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
                        }).catch(err => {
                            console.log(err);
                            nextDataset()
                        });
                    }, function () {
                        callback();
                    });
                }
            ], function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", _well));
            });
        }
    })
};
