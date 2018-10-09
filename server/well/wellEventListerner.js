const async = require('async');
let lengthConvert = require('../utils/convert-length');
wiEventEmitter.on('update-well-depth', function (idWell, dbConnection, cb) {
    console.log("=> Update well depth");
    cb();
    // dbConnection.Well.findById(idWell, {include: {model: dbConnection.Dataset}}).then(well => {
    //     let changed = false;
    //     let newDepth = {
    //         topDepth: 999999999,
    //         bottomDepth: -999999999
    //     };
    //     let wellUnit = well.unit;
    //     async.each(well.datasets, (dataset, next) => {
    //         let datasetUnit = dataset.unit;
    //         if (wellUnit && datasetUnit) {
    //             let d_top = lengthConvert.convertDistance(dataset.top, datasetUnit, wellUnit);
    //             let d_bottom = lengthConvert.convertDistance(dataset.bottom, dataset.unit, wellUnit);
    //
    //             if (d_top < newDepth.topDepth && d_top !== 0) {
    //                 changed = true;
    //                 newDepth.topDepth = d_top;
    //             }
    //             if (d_bottom > newDepth.bottomDepth && d_bottom !== 0) {
    //                 changed = true;
    //                 newDepth.bottomDepth = d_bottom;
    //             }
    //
    //             next();
    //
    //         } else {
    //             next();
    //         }
    //
    //     }, function () {
    //         if (changed) {
    //             Object.assign(well, newDepth).save().then(() => {
    //                 cb();
    //             }).catch(err => {
    //                 console.log(err);
    //                 cb();
    //             });
    //         } else {
    //             cb();
    //         }
    //     });
    // });
});