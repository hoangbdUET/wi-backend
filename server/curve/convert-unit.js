let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let curveFunction = require('../utils/curve.function');
let fs = require('fs');
let fsExtra = require('fs-extra');
let wiImport = require('wi-import');
let config = require('config');
let readline = require('readline');
let async = require('async');

module.exports = function (data, callback, dbConnection, username) {
    let ratio = data.desUnit.rate / data.srcUnit.rate;
    curveFunction.getFullCurveParents({idCurve: data.idCurve}, dbConnection).then(curveParents => {
        curveParents.username = username;
        let hashPath = wiImport.hashDir.createPath(config.curveBasePath, username + curveParents.project + curveParents.well + curveParents.dataset + curveParents.curve, curveParents.curve + '.txt');
        let tempfile = require('tempfile')('.txt');
        let rl = readline.createInterface({
            input: fs.createReadStream(hashPath)
        });
        let fd = fs.openSync(tempfile, 'w');
        rl.on('line', function (line) {
            let index = line.split(" ")[0];
            let valueString = line.split(" ")[1];
            if (valueString === 'null' || valueString === 'NaN') {
                fs.writeSync(fd, line + '\n');
            } else {
                fs.writeSync(fd, index + " " + parseFloat(valueString) * ratio + '\n');
            }
        });
        rl.on('close', function () {
            fsExtra.move(tempfile, hashPath, {overwrite: true}, err => {
                if (err) {
                    callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
                } else {
                    dbConnection.Curve.findById(data.idCurve).then(curve => {
                        curve.unit = data.desUnit.name;
                        curve.save().then(() => {
                            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", curveParents));
                        });
                    });
                    // dbConnection.Curve.findById(data.idCurve).then(curve => {
                    //     curve.unit = data.desUnit.name;
                    //     curve.save().then(() => {
                    //         async.parallel([
                    //             function (cb) {
                    //                 dbConnection.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
                    //                     async.each(lines, function (line, nextLine) {
                    //                         line.minValue = line.minValue * ratio;
                    //                         line.maxValue = line.maxValue * ratio;
                    //                         line.unit = curve.unit;
                    //                         line.save().then(() => {
                    //                             nextLine();
                    //                         })
                    //                     }, function () {
                    //                         cb();
                    //                     })
                    //                 });
                    //             },
                    //             function (cb) {
                    //                 async.parallel([
                    //                     function (c) {
                    //                         dbConnection.PointSet.findAll({where: {idCurveX: curve.idCurve}}).then(ps => {
                    //                             async.each(ps, function (p, nextP) {
                    //                                 p.scaleLeft = p.scaleLeft * ratio;
                    //                                 p.scaleRight = p.scaleRight * ratio;
                    //                                 p.save().then(() => {
                    //                                     nextP();
                    //                                 })
                    //                             }, function () {
                    //                                 c();
                    //                             });
                    //                         });
                    //                     },
                    //                     function (c) {
                    //                         dbConnection.PointSet.findAll({where: {idCurveY: curve.idCurve}}).then(ps => {
                    //                             async.each(ps, function (p, nextP) {
                    //                                 p.scaleTop = p.scaleTop * ratio;
                    //                                 p.scaleBottom = p.scaleBottom * ratio;
                    //                                 p.save().then(() => {
                    //                                     nextP();
                    //                                 })
                    //                             }, function () {
                    //                                 c();
                    //                             });
                    //                         });
                    //                     }
                    //                 ], function () {
                    //                     cb();
                    //                 })
                    //             },
                    //             function (cb) {
                    //                 dbConnection.Histogram.findAll({
                    //                     where: {idCurve: curve.idCurve}
                    //                 }).then(histograms => {
                    //                     async.each(histograms, function (histogram, nextH) {
                    //                         histogram.leftScale = histogram.leftScale * ratio;
                    //                         histogram.rightScale = histogram.rightScale * ratio;
                    //                         histogram.save().then(() => {
                    //                             nextH();
                    //                         });
                    //                     }, function () {
                    //                         cb();
                    //                     });
                    //                 });
                    //             }
                    //         ], function () {
                    //             callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", hashPath));
                    //         })
                    //     }).catch(err => {
                    //         callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    //     });
                    // });
                }

            });
        });
    })
};