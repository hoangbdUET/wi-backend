let curveModels = require('../curve/curve.model');
let asyncEach = require('async/each');
const checkPermisson = require('../utils/permission/check-permisison');
let async = require('async');
let mqtt = require('mqtt');
let config = require('config');

function importDataset(datasets, token, callback, dbConnection, username, createdBy, updatedBy, logger) {
	checkPermisson(updatedBy, 'project.import', perm => {
		if (!perm) {
			callback([], "Import: Do not have permission");
		} else {
			let response = [];
			asyncEach(datasets, function (dataset, next) {
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
				dbConnection.Dataset.findOrCreate({
					where: {name: newDataset.name, idWell: newDataset.idWell},
					defaults: newDataset
				}).then(rs => {
					let _dataset = rs[0];
					let MqttClient = mqtt.connect(process.env.BACKEND_MQTT_BROKER || config.mqttBroker || "wss://mqtt-broker.i2g.cloud:8083", {
						rejectUnauthorized: false,
						clientId: "wi_import_" + _dataset.updatedBy + "_" + _dataset.name + "_" + Math.random().toString(16).substr(2, 8)
					});
					MqttClient.on('connect', () => {
						console.log("Connected to broker " + (process.env.BACKEND_MQTT_BROKER || config.mqttBroker || "wss://mqtt-broker.i2g.cloud:8083"));
					});
					MqttClient.on('error', () => {
						console.log("Mqtt connect failed");
					});
					let topic = "import/dataset/" + _dataset.name + "/" + _dataset.idDataset;
					response.push({
						name: _dataset.name,
						idDataset: _dataset.idDataset,
						topic: topic
					});
					next();
					async.eachSeries(dataset.curves, function (curve, nextCurve) {
						curve.idDesDataset = _dataset.idDataset;
						curveModels.getCurveDataFromInventoryPromise(curve, token, dbConnection, username, createdBy, updatedBy, logger).then(curve => {
							MqttClient.publish(topic, JSON.stringify({
								name: curve.name, idCurve: curve.idCurve
							}), {qos: 2});
							nextCurve();
						}).catch(err => {
							MqttClient.publish(topic, JSON.stringify({
								name: curve.name
							}), {qos: 2});
							nextCurve();
						});
					}, function () {
						MqttClient.end();
					});
				}).catch(err => {
					console.log(err);
					next();
				});
			}, function () {
				callback(response);
			});
		}
	});
}

module.exports = {
	importDataset: importDataset
};