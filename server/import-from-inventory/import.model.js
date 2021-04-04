let curveModels = require('../curve/curve.model');
let asyncEach = require('async/each');
const checkPermisson = require('../utils/permission/check-permisison');
let async = require('async');
let mqtt = require('mqtt');
let config = require('config');
const {
	resolve
} = require('path');

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

function _importDataset(datasets, token, callback, dbConnection, username, createdBy, updatedBy) {
	checkPermisson(updatedBy, 'project.import', async perm => {
		if (!perm) {
			callback([], "Import: Do not have permission");
		} else {
			let response = [];
			for (let i = 0; i < datasets.length; i++) {
				let dataset = datasets[i];
				dataset.name = dataset.name.toUpperCase();
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
				let _dataset = (await dbConnection.Dataset.findOrCreate({
					where: {
						name: newDataset.name,
						idWell: newDataset.idWell
					},
					defaults: newDataset
				}))[0];
				datasets[i]._dataset = _dataset;
				let topic = "import/dataset/" + Math.random().toString(16).substr(2, 8) + "/" + _dataset.idDataset;
				datasets[i].topic = topic;
				response.push({
					name: _dataset.name,
					idDataset: _dataset.idDataset,
					topic: topic
				});
			}
			doImportCurves(datasets, token, dbConnection, username, createdBy, updatedBy);
			callback(response);
		}
	})
}

function publishPromise(MqttClient, _curve, dataset) {
	return new Promise(resolve => {
		MqttClient.publish(dataset.topic, JSON.stringify({
			name: _curve.name,
			idCurve: _curve.idCurve
		}), {
			qos: 2
		}, function () {
			resolve();
		});
	})
}

async function doImportCurves(datasets, token, dbConnection, username, createdBy, updatedBy) {
	// let clientId = "wi_import_" + _dataset.updatedBy + "_" + _dataset.name + "_" + Math.random().toString(16).substr(2, 8);
	let clientId = "wi_import_" + username + "_" + Math.random().toString(16).substr(2, 8);
	let MqttClient = mqtt.connect(process.env.BACKEND_MQTT_BROKER || config.mqttBroker || "wss://mqtt-broker.i2g.cloud:8083", {
		rejectUnauthorized: false,
		clientId: clientId,
		clean: false,
		keepalive: 30
	});
	MqttClient.on('connect', async () => {
		console.log("Connected to broker " + (process.env.BACKEND_MQTT_BROKER || config.mqttBroker || "wss://mqtt-broker.i2g.cloud:8083"), " with id ", clientId);
	});
	MqttClient.on('close', () => {
		console.log("MQTT Client End ", clientId);
	})
	MqttClient.on('error', () => {
		console.log("Mqtt connect failed");
	});
	for (let i = 0; i < datasets.length; i++) {
		await sleep(2000);
		let dataset = datasets[i];
		let _dataset = datasets[i]._dataset;
		for (let j = 0; j < dataset.curves.length; j++) {
			let curve = dataset.curves[j]
			await sleep(500);
			curve.idDesDataset = _dataset.idDataset;
			let _curve = await curveModels.getCurveDataFromInventoryPromise(curve, token, dbConnection, username, createdBy, updatedBy);
			await publishPromise(MqttClient, _curve, dataset)
		}
	}
	MqttClient.end();
}

// function importDataset(datasets, token, callback, dbConnection, username, createdBy, updatedBy) {
// 	checkPermisson(updatedBy, 'project.import', perm => {
// 		if (!perm) {
// 			callback([], "Import: Do not have permission");
// 		} else {
// 			let response = [];

// 			asyncEach(datasets, function (dataset, next) {
// 				dataset.name = dataset.name.toUpperCase();
// 				let newDataset = {};
// 				newDataset.name = dataset.name;
// 				newDataset.step = dataset.step;
// 				newDataset.top = dataset.top;
// 				newDataset.bottom = dataset.bottom;
// 				newDataset.unit = dataset.unit;
// 				newDataset.datasetKey = dataset.name;
// 				newDataset.datasetLabel = dataset.name;
// 				newDataset.idWell = dataset.idDesWell;
// 				newDataset.createdBy = createdBy;
// 				newDataset.updatedBy = updatedBy;
// 				dbConnection.Dataset.findOrCreate({
// 					where: { name: newDataset.name, idWell: newDataset.idWell },
// 					defaults: newDataset
// 				}).then(rs => {
// 					let _dataset = rs[0];
// 					let MqttClient = mqtt.connect(process.env.BACKEND_MQTT_BROKER || config.mqttBroker || "wss://mqtt-broker.i2g.cloud:8083", {
// 						rejectUnauthorized: false,
// 						clientId: "wi_import_" + _dataset.updatedBy + "_" + _dataset.name + "_" + Math.random().toString(16).substr(2, 8),
// 						clean: false
// 					});
// 					MqttClient.on('connect', () => {
// 						console.log("Connected to broker " + (process.env.BACKEND_MQTT_BROKER || config.mqttBroker || "wss://mqtt-broker.i2g.cloud:8083"));
// 					});
// 					MqttClient.on('error', () => {
// 						console.log("Mqtt connect failed");
// 					});
// 					let topic = "import/dataset/" + _dataset.name + "/" + _dataset.idDataset;
// 					response.push({
// 						name: _dataset.name,
// 						idDataset: _dataset.idDataset,
// 						topic: topic
// 					});
// 					next();
// 					async.eachSeries(dataset.curves, function (curve, nextCurve) {
// 						curve.idDesDataset = _dataset.idDataset;
// 						curveModels.getCurveDataFromInventoryPromise(curve, token, dbConnection, username, createdBy, updatedBy).then(curve => {
// 							MqttClient.publish(topic, JSON.stringify({
// 								name: curve.name, idCurve: curve.idCurve
// 							}), { qos: 2 });
// 							nextCurve();
// 						}).catch(err => {
// 							MqttClient.publish(topic, JSON.stringify({
// 								name: curve.name
// 							}), { qos: 2 });
// 							nextCurve();
// 						});
// 					}, function () {
// 						MqttClient.end();
// 					});
// 				}).catch(err => {
// 					console.log(err);
// 					next();
// 				});
// 			}, function () {
// 				callback(response);
// 			});
// 		}
// 	});
// }

module.exports = {
	importDataset: _importDataset,
};