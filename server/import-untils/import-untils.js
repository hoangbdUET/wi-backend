var models = require('../models');
var Well = models.Well;
var Dataset = models.Dataset;
var Curve = models.Curve;

function createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo) {
    //console.log(JSON.stringify(datasetInfo[0].curves));
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

function createCurvesWithWellExist(wellInfo, datasetInfo, option) {
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

function createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, option) {
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

module.exports.createCurvesWithProjectExist = createCurvesWithProjectExist;
module.exports.createCurvesWithWellExist = createCurvesWithWellExist;
module.exports.createCurvesWithDatasetExist = createCurvesWithDatasetExist;