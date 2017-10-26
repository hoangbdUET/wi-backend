var express = require('express');
var router = express.Router();
var Model = require('./object-track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/object-track/info', function (req, res) {
    Model.infoObjectTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/object-track/new', function (req, res) {
    Model.createObjectTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/object-track/edit', function (req, res) {
    Model.editObjectTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.delete('/object-track/delete', function (req, res) {
    Model.deleteObjectTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

module.exports = router;