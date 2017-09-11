// var models = require('../models');
// var Well=models.Well;
// var Dataset=models.Dataset;
// var Curve=models.Curve;

function createCurvesWithProjectExist(projectInfo,wellInfo,datasetInfo,curvesInfo,dbConnection) {
    return Well.create({
        idProject: projectInfo.idProject,
        name: wellInfo.name,
        topDepth: wellInfo.topDepth,
        bottomDepth: wellInfo.bottomDepth,
        step: wellInfo.step,
        datasets: [{
            name: wellInfo.name,
            datasetKey:datasetInfo.datasetKey,
            datasetLabel:datasetInfo.datasetLabel,
            curves: curvesInfo
        }]
    },{
        include:[{model:models.Dataset,include:[models.Curve]}]
    });
}

function createCurvesWithWellExist(wellInfo,datasetInfo,curvesInfo,option,dbConnection) {

    return models.sequelize.transaction(function (t) {
        return Dataset.create({
            idWell:wellInfo.idWell,
            name:wellInfo.name,
            datasetKey:datasetInfo.datasetKey,
            datasetLabel:datasetInfo.datasetLabel,
            curves:curvesInfo
        },{
            include:[models.Curve],
            transaction:t
        }).then(function (dataset) {
            if (option.overwrite) {
                return Well.findById(wellInfo.idWell, {include: [{all: true, include: {all: true}}], transaction: t})
                    .then(function (well) {
                        well.name = wellInfo.name;
                        well.topDepth = wellInfo.topDepth;
                        well.bottomDepth = wellInfo.bottomDepth;
                        well.step = wellInfo.step;
                        return well.save({transaction:t});
                    });
            }
            else {
                return Well.findById(wellInfo.idWell,{include: [{all: true, include: {all: true}}], transaction: t})
            }
        })
    })


}

function createCurvesWithDatasetExist(wellInfo, datasetInfo,curvesInfo,option,dbConnection) {
    curvesInfo.forEach(function (item) {
        item.idDataset = datasetInfo.idDataset;
    });
    return models.sequelize.transaction(function (t) {
        return Curve.bulkCreate(curvesInfo,{transaction:t,individualHooks:true})
            .then(function (dataset) {
            if (option.overwrite) {
                return Well.findById(wellInfo.idWell, {include: [{all: true, include: {all: true}}], transaction: t})
                    .then(function (well) {
                        well.name = wellInfo.name;
                        well.topDepth = wellInfo.topDepth;
                        well.bottomDepth = wellInfo.bottomDepth;
                        well.step = wellInfo.step;
                        return well.save({transaction:t});
                    });
            }
            else {
                return Well.findById(wellInfo.idWell,{include: [{all: true, include: {all: true}}], transaction: t})
            }
        })
    })
}

//example***************************************

// var curves = [{
//     "name":"Ex-Curve",
//     "dataset": "",
//     "family":"Rate of opreration",
//     "unit": "mn/m",
//     "initValue":"30"
// },{
//     "name":"Ex-Curve",
//     "dataset": "",
//     "family":"Rate of opreration",
//     "unit": "mn/m",
//     "initValue":"30"
// },{
//     "name":"Ex-Curve",
//     "dataset": "",
//     "family":"Rate of opreration",
//     "unit": "mn/m",
//     "initValue":"30"
// }];
// var project = {
//     idProject:1
// };
// var well = {
//     "idWell":2,//createCurves with Project exist khong can idWell
//     "name": "Ex-Hoang-Thanh",
//     "topDepth": "10",
//     "bottomDepth": "50",
//     "step": "30"
// };
// var dataset = {
//     idDataset:6
// };
// createCurvesWithProjectExist(project, well, curves)
//     .then(function (result) {
//         console.log("thanh cong ");
//         // console.log(result.dataValues.idWell);
//         console.log(result.toJSON());
//         //
//         Well.findById(result.dataValues.idWell, {include: [{all: true}]})
//             .then(function (aWell) {
//             })
//     })
//
//     .catch(function (err) {
//         console.log("THAWT BAI");
//         console.log(err);
//     });

// createCurvesWithWellExist(well, curves, {overwrite: true})
//     .then(function (result) {
//         console.log(result.toJSON());
//     });
//
// createCurvesWithDatasetExist(dataset, curves,{overwrite:false})
//     .then(function (result) {
//         console.log(result.toJSON());
//
//     })

module.exports.createCurvesWithProjectExist = createCurvesWithProjectExist;
module.exports.createCurvesWithWellExist = createCurvesWithWellExist;
module.exports.createCurvesWithDatasetExist = createCurvesWithDatasetExist;