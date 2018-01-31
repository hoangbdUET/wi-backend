"use strict";


function createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, dbConnection) {
    let Well = dbConnection.Well;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    return Well.create({
        idProject: projectInfo.idProject,
        name: wellInfo.name,
        topDepth: wellInfo.topDepth,
        bottomDepth: wellInfo.bottomDepth,
        step: wellInfo.step,
        datasets: datasetInfo
    }, {
        include: [{model: Dataset, include: [Curve]}]
    });
}

function createCurvesWithWellExist(wellInfo, datasetInfo, option, dbConnection) {
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
                return Well.findById(wellInfo.idWell, {
                    include: [{all: true, include: {all: true}}],
                    transaction: t
                })
                    .then(function (well) {
                        well.name = wellInfo.name;
                        well.topDepth = wellInfo.topDepth;
                        well.bottomDepth = wellInfo.bottomDepth;
                        well.step = wellInfo.step;
                        return well.save({transaction: t});
                    });
            }
            else {
                return Well.findById(wellInfo.idWell, {
                    include: [{all: true, include: {all: true}}],
                    transaction: t
                })
            }
        })
    });
}

function createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, option, dbConnection) {
    curvesInfo.forEach(function (item) {
        item.idDataset = datasetInfo.idDataset;
    });
    return dbConnection.sequelize.transaction(function (t) {
        return Curve.bulkCreate(curvesInfo, {transaction: t, individualHooks: true})
            .then(function (dataset) {
                if (option.overwrite) {
                    return Well.findById(wellInfo.idWell, {
                        include: [{all: true, include: {all: true}}],
                        transaction: t
                    })
                        .then(function (well) {
                            well.name = wellInfo.name;
                            well.topDepth = wellInfo.topDepth;
                            well.bottomDepth = wellInfo.bottomDepth;
                            well.step = wellInfo.step;
                            return well.save({transaction: t});
                        });
                }
                else {
                    return Well.findById(wellInfo.idWell, {
                        include: [{all: true, include: {all: true}}],
                        transaction: t
                    })
                }
            })
    });

}

function createCurvesWithWellExistLAS3(wellInfo, datasetInfo, option, callback, dbConnection) {
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
                            callback(false, Well.findById(wellInfo.idWell, {
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

function createCurvesWithDatasetExistLAS3(wellInfo, datasetInfo, option, callback, dbConnection) {
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Well = dbConnection.Well;
    if (option.overwrite) {

    } else {
        datasetInfo[0].curves.forEach(function (curve) {
            curve.idDataset = datasetInfo[0].idDataset;
            Curve.findOrCreate({where: {idCurve: curve.idCurve}, defaults: curve}).then(rs => {
                callback(false, Well.findById(wellInfo.idWell, {include: [{all: true}]}));
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