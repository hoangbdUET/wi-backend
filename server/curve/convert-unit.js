let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let curveFunction = require('../utils/curve.function');
let fs = require('fs');
let fsExtra = require('fs-extra');
let wiImport = require('wi-import');
let config = require('config');
let readline = require('readline');
let checkPerm = require('../utils/permission/check-permisison');

module.exports = function (data, callback, dbConnection, username) {
    checkPerm(data.updatedBy, 'curve.update', function (pass) {
        if (pass) {
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
                                    callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", curveParents));
                                });
                            });
                        }

                    });
                });
            })
        } else {
            callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve : Do not have permission", "Curve : Do not have permission"));
        }
    });
};