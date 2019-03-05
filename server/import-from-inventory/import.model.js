let curveModels = require('../curve/curve.model');
let asyncEach = require('async/each');
let request = require('request');
let config = require('config');
let asyncQueue = require('async/queue');
let hashDir = require('../utils/data-tool').hashDir;
let fs = require('fs-extra');
let async = require('async');
const logMessage = require('../log-message');

class Options {
	constructor(path, token, payload) {
		this.method = 'POST';
		this.url = config.Service.inventory + path;
		this.headers = {
			'Cache-Control': 'no-cache',
			Authorization: token,
			'Content-Type': 'application/json'
		};
		this.body = payload;
		this.json = true;
		this.strictSSL = false;
	}
}

function getWellFromInventory(well, token) {
	return new Promise(function (resolve, reject) {
		let options = new Options('/user/well/full-info', token, {name: well.name});
		request(options, function (error, response, body) {
			if (error) {
				reject(error);
			} else {
				if (body.content) {
					resolve(body.content);
				} else {
					reject(body)
				}
			}
		});
	});
}

// async function importWell(well, token, callback, dbConnection, username, createdBy, updatedBy, logger) {
// 	let Op = require('sequelize').Op;
// 	let wiProject = (await dbConnection.Project.findOrCreate({
// 		where: {
// 			name: {[Op.eq]: well.projectName}
// 		},
// 		defaults: {
// 			name: well.projectName,
// 			description: "Project created by batch service",
// 		}
// 	}))[0];
// 	try {
// 		let _well = await getWellFromInventory({name: well.name}, token);
// 		let topDepth = _well.well_headers.find(h => h.header === 'TOP').value;
// 		let bottomDepth = _well.well_headers.find(h => h.header === 'STOP').value;
// 		let step = _well.well_headers.find(h => h.header === 'STEP').value;
// 		dbConnection.Well.create({
// 			name: _well.name,
// 			idProject: wiProject.idProject,
// 			topDepth: topDepth,
// 			bottomDepth: bottomDepth,
// 			step: step,
// 			createdBy: createdBy,
// 			updatedBy: updatedBy
// 		}).then(wiWell => {
// 			asyncEach(_well.datasets, async function (dataset) {
// 				let wiDataset = await dbConnection.Dataset.create({
// 					name: dataset.name,
// 					datasetKey: dataset.name,
// 					datasetLabel: dataset.name,
// 					idWell: wiWell.idWell,
// 					createdBy: createdBy,
// 					updatedBy: updatedBy
// 				});
// 				let queue = asyncQueue(function (curve, cb) {
// 					let options = {
// 						method: 'POST',
// 						url: config.Service.inventory + '/user/well/dataset/curve/data',
// 						headers:
// 							{
// 								Authorization: token,
// 								'Content-Type': 'application/json'
// 							},
// 						body: {idCurve: curve.idCurve},
// 						json: true,
// 						strictSSL: false
// 					};
// 					dbConnection.Curve.create({
// 						name: curve.name,
// 						unit: curve.curve_revisions[0].unit,
// 						idDataset: wiDataset.idDataset,
// 						createdBy: createdBy,
// 						updatedBy: updatedBy
// 					}).then(c => {
// 						let _curve = c;
// 						let curvePath = hashDir.createPath(config.curveBasePath, username + wiProject.name + wiWell.name + wiDataset.name + _curve.name, _curve.name + '.txt');
// 						try {
// 							let stream = request(options).pipe(fs.createWriteStream(curvePath));
// 							stream.on('close', function () {
// 								cb(null, _curve);
// 							});
// 							stream.on('error', function (err) {
// 								cb(err, null);
// 							});
// 						} catch (err) {
// 							cb(err, null);
// 						}
// 					});
// 				}, 2);
// 				queue.drain = function () {
// 					console.log("All Curve Done");
// 				};
// 				dataset.curves.forEach(function (curve) {
// 					queue.push(curve, function (err, success) {
// 					});
// 				});
// 			}, function () {
// 				let wellHeaders = _well.well_headers;
// 				asyncEach(wellHeaders, function (wellHeader, next) {
// 					dbConnection.WellHeader.findOrCreate({
// 						where: {header: wellHeader.header, idWell: wiWell.idWell}, defaults: {
// 							header: wellHeader.header,
// 							value: wellHeader.value,
// 							idWell: wiWell.idWell
// 						}
// 					})
// 				});
// 				callback(null, wiWell);
// 			});
// 		}).catch(err => {
// 			if (err.name === "SequelizeUniqueConstraintError") {
// 				dbConnection.Well.findOne({
// 					where: {
// 						[Op.and]: [
// 							{name: {[Op.eq]: _well.name}},
// 							{idProject: wiProject.idProject}
// 						]
// 					}
// 				}).then(existedWell => {
// 					callback(null, existedWell);
// 				});
// 			} else {
// 				callback({idProject: wiProject.idProject, reason: "Error"}, null);
// 			}
// 		});
// 	} catch (e) {
// 		if (e.name === "SequelizeUniqueConstraintError") {
// 			console.log(e);
// 			callback({idProject: wiProject.idProject, reason: "Well's name already exists"}, null);
// 		} else {
// 			console.log(e);
// 			callback({idProject: wiProject.idProject, reason: e}, null);
// 		}
// 	}
//
// }

// function importCurves(curves, token, callback, dbConnection, username) {
// 	let response = [];
// 	asyncEach(curves, function (curve, next) {
// 		setTimeout(function () {
// 			curveModels.getCurveDataFromInventory(curve, token, function (err, result) {
// 				if (err) {
// 					response.push(err);
// 				} else {
// 					response.push(result);
// 				}
// 				next();
// 			}, dbConnection, username);
// 		}, 100);
// 	}, function () {
// 		callback(response);
// 	});
// }

function importDataset(datasets, token, callback, dbConnection, username, createdBy, updatedBy, logger, MqttClient) {
	// let response = {
	//     curves: [],
	//     datasets: []
	// };
	let response = [];
	asyncEach(datasets, function (dataset, next) {
		let newDataset = {};
		newDataset.name = dataset.name;
		newDataset.step = dataset.step;
		newDataset.top = dataset.top;
		newDataset.bottom = dataset.bottom;
		newDataset.unit = dataset.unit;
		newDataset.datasetKey = dataset.name;
		newDataset.datasetLabel = dataset.name;
		newDataset.idWell = dataset.idDesWell;
		newDataset.createdBy = createdBy;
		newDataset.updatedBy = updatedBy;
		dbConnection.Dataset.findOrCreate({
			where: {name: newDataset.name, idWell: newDataset.idWell},
			defaults: newDataset
		}).then(rs => {
			let _dataset = rs[0];
			let topic = "import/dataset/" + _dataset.name + "/" + _dataset.idDataset;
			response.push({
				name: _dataset.name,
				idDataset: _dataset.idDataset,
				topic: topic
			});
			next();
			MqttClient.publish(topic, JSON.stringify({
				status: "__TEST",
				message: "Bat dau chay nay",
				content: {}
			}), {qos: 2});
			if (rs[1]) {
				//created
				logger.info(logMessage("DATASET", _dataset.idDataset, "Created"));
				// response.datasets.push(_dataset);
				async.eachSeries(dataset.curves, function (curve, nextCurve) {
					curve.idDesDataset = _dataset.idDataset;
					curveModels.getCurveDataFromInventoryPromise(curve, token, dbConnection, username, createdBy, updatedBy, logger).then(curve => {
						// response.curves.push(curve);
						MqttClient.publish(topic, JSON.stringify({
							status: "__CURVE",
							message: "__DONE",
							content: {name: curve.name, idCurve: curve.idCurve}
						}), {qos: 2});
						nextCurve();
					}).catch(err => {
						// response.curves.push(err);
						MqttClient.publish(topic, JSON.stringify({
							status: "__CURVE",
							message: "__ERROR",
							content: {name: curve.name}
						}), {qos: 2});
						nextCurve();
					});
				}, function () {
					// next();
				});
			} else {
				//found
				logger.info(logMessage("DATASET", _dataset.idDataset, "Updated"));
				let newDataset = _dataset.toJSON();
				newDataset.name = newDataset.name + "_CP" + newDataset.duplicated;
				_dataset.duplicated++;
				_dataset.save();
				delete newDataset.idDataset;
				newDataset.step = dataset.step;
				newDataset.top = dataset.top;
				newDataset.bottom = dataset.bottom;
				newDataset.unit = dataset.unit;
				newDataset.datasetKey = dataset.name;
				newDataset.datasetLabel = dataset.name;
				dbConnection.Dataset.create(newDataset).then(d => {
					// response.datasets.push(d);
					async.eachSeries(dataset.curves, function (curve, nextCurve) {
						curve.idDesDataset = d.idDataset;
						curveModels.getCurveDataFromInventoryPromise(curve, token, dbConnection, username, createdBy, updatedBy, logger).then(curve => {
							MqttClient.publish(topic, JSON.stringify({
								status: "__CURVE",
								message: "__DONE",
								content: {name: curve.name, idCurve: curve.idCurve}
							}), {qos: 2});
							// response.curves.push(curve);
							nextCurve();
						}).catch(err => {
							// response.curves.push(err);
							MqttClient.publish(topic, JSON.stringify({
								status: "__CURVE",
								message: "__ERROR",
								content: {name: curve.name}
							}), {qos: 2});
							nextCurve();
						});
					}, function () {

					});
				}).catch(err => {
					console.log(err);
				});
			}
		}).catch(err => {
			console.log(err);
			// response.curves.push(err);
			next();
		});
	}, function () {
		callback(response);
	});
}

module.exports = {
	// importCurves: importCurves,
	importDataset: importDataset,
	// importWell: importWell
}