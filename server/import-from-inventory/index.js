let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let model = require('./import.model');
let mqtt = require('mqtt');
let MqttClient = mqtt.connect("ws://mqtt-broker.i2g.cloud:8888");
MqttClient.on('connect', () => {
	console.log("Connected to broker ws://mqtt-broker.i2g.cloud:8888");
});
MqttClient.on('error', () => {
	console.log("Mqtt connect failed");
});
router.use(bodyParser.json());

// router.post('/inventory/import/curve', function (req, res) {
// 	let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
// 	let curves = req.body;
// 	model.importCurves(curves, token, function (response) {
// 		res.send(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
// 	}, req.dbConnection, req.decoded.username, req.createdBy, req.updatedBy, req.logger, MqttClient);
// });

router.post('/inventory/import/dataset', function (req, res) {
	let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
	let datasets = req.body;
	model.importDataset(datasets, token, function (response) {
		res.send(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
	}, req.dbConnection, req.decoded.username, req.createdBy, req.updatedBy, req.logger, MqttClient);
});

module.exports = router;