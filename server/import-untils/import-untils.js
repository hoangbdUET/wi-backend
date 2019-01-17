"use strict";
let asyncEach = require('async/each');

// function _createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, dbConnection) {
//     let Well = dbConnection.Well;
//     let Dataset = dbConnection.Dataset;
//     let Curve = dbConnection.Curve;
//     return Well.create({
//         idProject: projectInfo.idProject,
//         name: wellInfo.name,
//         topDepth: wellInfo.topDepth,
//         bottomDepth: wellInfo.bottomDepth,
//         step: wellInfo.step,
//         datasets: datasetInfo
//     }, {
//         include: [{model: Dataset, include: [Curve]}]
//     });
// }

function createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, dbConnection, createdBy, updatedBy) {
    return new Promise(function (resolve, reject) {
        dbConnection.Well.findOrCreate({
            where: {name: wellInfo.name, idProject: projectInfo.idProject}, defaults: {
                name: wellInfo.name,
                topDepth: wellInfo.topDepth,
                bottomDepth: wellInfo.bottomDepth,
                step: wellInfo.step,
                createdBy: createdBy,
                updatedBy: updatedBy
            }
        }).then(rs => {
            let well = rs[0];
            dbConnection.Dataset.findOrCreate({
                where: {name: datasetInfo.name, idWell: well.idWell}, defaults: {
                    name: datasetInfo.name,
                    datasetKey: datasetInfo.datasetKey,
                    datasetLabel: datasetInfo.datasetLabel,
                    createdBy: createdBy,
                    updatedBy: updatedBy
                }
            }).then(d => {
                let dataset = d[0];
                asyncEach(datasetInfo.curves, function (curve, next) {
                    dbConnection.Curve.findOrCreate({
                        where: {name: curve.name, idDataset: dataset.idDataset}, defaults: {
                            name: curve.name,
                            unit: curve.unit,
                            createdBy: createdBy,
                            updatedBy: updatedBy
                        }
                    }).then(() => {
                        next();
                    }).catch(err => {
                        console.log(err);
                        next();
                    })
                }, function () {
                    resolve();
                });
            });
        })
    });
}

function createCurvesWithWellExist(wellInfo, datasetInfo, option, dbConnection, createdBy, updatedBy) {
    let Dataset = dbConnection.Dataset;
    let Well = dbConnection.Well;
    let Curve = dbConnection.Curve;
    return dbConnection.sequelize.transaction(function (t) {
        return Dataset.create({
            idWell: wellInfo.idWell,
            name: wellInfo.name,
            datasetKey: datasetInfo.datasetKey,
            datasetLabel: datasetInfo.datasetLabel,
            curves: datasetInfo.curves
        }, {
            include: [Curve],
            transaction: t
        }).then(function (dataset) {
            if (option.overwrite) {
                return Well.findByPk(wellInfo.idWell, {
                    include: [{all: true, include: {all: true}}],
                    transaction: t
                })
                    .then(function (well) {
                        well.name = wellInfo.name;
                        well.topDepth = wellInfo.topDepth;
                        well.bottomDepth = wellInfo.bottomDepth;
                        well.step = wellInfo.step;
                        well.createdBy = createdBy;
                        well.updatedBy = updatedBy;
                        return well.save({transaction: t});
                    });
            }
            else {
                return Well.findByPk(wellInfo.idWell, {
                    include: [{all: true, include: {all: true}}],
                    transaction: t
                })
            }
        })
    });
}

function createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, option, dbConnection, createdBy, updatedBy) {
    curvesInfo.forEach(function (item) {
        item.idDataset = datasetInfo.idDataset;
    });
    return dbConnection.sequelize.transaction(function (t) {
        return Curve.bulkCreate(curvesInfo, {transaction: t, individualHooks: true})
            .then(function (dataset) {
                if (option.overwrite) {
                    return Well.findByPk(wellInfo.idWell, {
                        include: [{all: true, include: {all: true}}],
                        transaction: t
                    })
                        .then(function (well) {
                            well.name = wellInfo.name;
                            well.topDepth = wellInfo.topDepth;
                            well.bottomDepth = wellInfo.bottomDepth;
                            well.step = wellInfo.step;
                            well.createdBy = createdBy;
                            well.updatedBy = updatedBy;
                            return well.save({transaction: t});
                        });
                }
                else {
                    return Well.findByPk(wellInfo.idWell, {
                        include: [{all: true, include: {all: true}}],
                        transaction: t
                    })
                }
            })
    });

}

function createCurvesWithWellExistLAS3(wellInfo, datasetInfo, option, callback, dbConnection, createdBy, updatedBy) {
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Well = dbConnection.Well;
    if (option.overwrite) {

    } else {
        let count = 0;
        datasetInfo.forEach(function (dataset) {
            dataset.idWell = wellInfo.idWell;
            Dataset.findOrCreate({where: {name: dataset.name, idWell: wellInfo.idWell}, defaults: dataset}).then(rs => {
                dataset.curves.forEach(function (curve) {
                    curve.idDataset = rs[0].idDataset;
                    Curve.findOrCreate({
                        where: {name: curve.name, idDataset: curve.idDataset},
                        defaults: curve
                    }).then(rss => {
                        count++;
                        if (count == dataset.curves.length) {
                            callback(false, Well.findByPk(wellInfo.idWell, {
                                include: [{all: true}]
                                // , {include: {all: true}}
                            }));
                            count = 0;
                        }
                    }).catch(err => {
                        console.log("Create curve err : " + err.message);
                        callback(err, null);
                    })
                });

            }).catch(err => {
                console.log("Create dataset err : " + err.message);
                callback(err, null);
            });
        });
    }
}

function createCurvesWithDatasetExistLAS3(wellInfo, datasetInfo, option, callback, dbConnection, createdBy, updatedBy) {
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Well = dbConnection.Well;
    if (option.overwrite) {

    } else {
        datasetInfo[0].curves.forEach(function (curve) {
            curve.idDataset = datasetInfo[0].idDataset;
            Curve.findOrCreate({where: {idCurve: curve.idCurve}, defaults: curve}).then(rs => {
                callback(false, Well.findByPk(wellInfo.idWell, {include: [{all: true}]}));
            }).catch(err => {
                callback(err, null);
            })
        });
    }
}

module.exports.createCurvesWithDatasetExistLAS3 = createCurvesWithDatasetExistLAS3;
module.exports.createCurvesWithWellExistLAS3 = createCurvesWithWellExistLAS3;
module.exports.createCurvesWithProjectExist = createCurvesWithProjectExist;
module.exports.createCurvesWithWellExist = createCurvesWithWellExist;
module.exports.createCurvesWithDatasetExist = createCurvesWithDatasetExist;