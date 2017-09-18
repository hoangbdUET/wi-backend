var express = require('express');
var router = express.Router();
var markerModel = require('./marker.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/marker/new', function (req, res) {
    markerModel.createNewMarker(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

router.post('/marker/info', function (req, res) {
    markerModel.getMarkerInfo(req.body, function (status) {
        res.send(status);
    },req.dbConnection)
});

router.post('/marker/edit', function (req, res) {
    markerModel.editMarker(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

router.delete('/marker/delete', function (req, res) {
    markerModel.deleteMarker(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

module.exports = router;