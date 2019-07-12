let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let curveFunction = require('../utils/curve.function');
let fs = require('fs');
let fsExtra = require('fs-extra');
let hashDir = require('../utils/data-tool').hashDir;
let config = require('config');
let readline = require('readline');
let checkPerm = require('../utils/permission/check-permisison');

module.exports = function (data, callback, dbConnection, username, logger) {
	checkPerm(data.updatedBy, 'curve.update', function (pass) {
		if (pass) {
			// let ratio = data.desUnit.rate / data.srcUnit.rate;
			let s1 = JSON.parse(data.srcUnit.rate);
			let s2 = JSON.parse(data.desUnit.rate);
			curveFunction.getFullCurveParents({idCurve: data.idCurve}, dbConnection).then(curveParents => {
				curveParents.username = username;
				let hashPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + curveParents.project + curveParents.well + curveParents.dataset + curveParents.curve, curveParents.curve + '.txt');
				let tempfile = require('tempfile')('.txt');
				let rl = readline.createInterface({
					input: fs.createReadStream(hashPath)
				});
				let fd = fs.openSync(tempfile, 'w');
				rl.on('line', function (line) {
					let result = [];
					let lineArray = line.trim().split(/\s+/);
					let index = lineArray.splice(0, 1);
					lineArray.forEach(valueString => {
						if (valueString === 'null' || valueString === 'NaN') {
							result.push(valueString)
						} else {
							result.push((parseFloat(valueString) - s1[1]) * (s2[0] / s1[0]) + s2[1]);
						}
					});
					fs.writeSync(fd, index + " " + result.join(" ") + '\n');
					// let index = line.split(" ")[0];
					// let valueString = line.split(" ")[1];
					// if (valueString === 'null' || valueString === 'NaN') {
					// 	fs.writeSync(fd, line + '\n');
					// } else {
					// 	let value = (parseFloat(valueString) - s1[1]) * (s2[0] / s1[0]) + s2[1];
					// 	fs.writeSync(fd, index + " " + value + '\n');
					// }
				});
				rl.on('close', function () {
					fsExtra.move(tempfile, hashPath, {overwrite: true}, err => {
						if (err) {
							callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
						} else {
							dbConnection.Curve.findByPk(data.idCurve).then(curve => {
								curve.unit = data.desUnit.name;
								curve.save().then(() => {
									logger.info("CURVE", curve.idCurve, "Unit Converted");
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