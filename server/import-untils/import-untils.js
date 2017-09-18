"use strict";


function createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo,dbConnection) {
    var Well = dbConnection.Well;
    return Well.create({
        idProject: projectInfo.idProject,
        name: wellInfo.name,
        topDepth: wellInfo.topDepth,
        bottomDepth: wellInfo.bottomDepth,
        step: wellInfo.step,
        datasets: datasetInfo
    }, {
        include: [{model: models.Dataset, include: [models.Curve]}]
    });
}

function createCurvesWithWellExist(wellInfo, datasetInfo, option,dbConnection) {
    var Dataset = dbConnection.Dataset;
    var Well = dbConnection.Well;
    var Curve = dbConnection.Curve;
    return models.sequelize.transaction(function (t) {
        return Dataset.create({
            idWell: wellInfo.idWell,
            name: wellInfo.name,
            datasetKey: datasetInfo.datasetKey,
            datasetLabel: datasetInfo.datasetLabel,
            curves: datasetInfo.curves
        }, {
            include: [models.Curve],
            transaction: t
        }).then(function (dataset) {
            if (option.overwrite) {
                return Well.findById(wellInfo.idWell, {include: [{all: true, include: {all: true}}], transaction: t})
                    .then(function (well) {
                        well.name = wellInfo.name;
                        well.topDepth = wellInfo.topDepth;
                        well.bottomDepth = wellInfo.bottomDepth;
                        well.step = wellInfo.step;
                        return well.save({transaction: t});
                    });
            }
            else {
                return Well.findById(wellInfo.idWell, {include: [{all: true, include: {all: true}}], transaction: t})
            }
        })
    })
}

function createCurvesWithDatasetExist(wellInfo, datasetInfo,curvesInfo,option,dbConnection) {
    curvesInfo.forEach(function (item) {
        item.idDataset = datasetInfo.idDataset;
    });
    return models.sequelize.transaction(function (t) {
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
    })
}

function createCurvesWithWellExistLAS3(wellInfo, datasetInfo, option, callback,dbConnection) {
    var Dataset = dbConnection.Dataset;
    var Curve = dbConnection.Curve;
    var Well = dbConnection.Well;
    datasetInfo.forEach(function (dataset) {
        dataset.idWell = wellInfo.idWell;
        Dataset.create(dataset).then(rs => {
            dataset.curves.forEach(function (curve) {
                curve.idDataset = rs.idDataset;
                Curve.create(curve).then(rss => {
                    callback(false, Well.findById(wellInfo.idWell, {
                        include: [{all: true}, {include: {all: true}}]
                    }));
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

function createCurvesWithDatasetExistLAS3(wellInfo, datasetInfo, option, callback,dbConnection) {
    var Curve = dbConnection.Curve;
    var Well = dbConnection.Well;
    datasetInfo[0].curves.forEach(function (curve) {
        curve.idDataset = datasetInfo[0].idDataset;
        Curve.create(curve).then(rs => {
            callback(false, Well.findById(wellInfo.idWell, {include: [{all: true}, {include: {all: true}}]}));
        }).catch(err => {
            callback(err, null);
        })
    });
}

module.exports.createCurvesWithDatasetExistLAS3 = createCurvesWithDatasetExistLAS3;
module.exports.createCurvesWithWellExistLAS3 = createCurvesWithWellExistLAS3;
module.exports.createCurvesWithProjectExist = createCurvesWithProjectExist;
module.exports.createCurvesWithWellExist = createCurvesWithWellExist;
module.exports.createCurvesWithDatasetExist = createCurvesWithDatasetExist;