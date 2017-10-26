var express = require('express');
var router = express.Router();
var Model = require('./image-track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/image-track/info', function (req, res) {
    Model.infoImageTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/image-track/new', function (req, res) {
    Model.createImageTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/image-track/edit', function (req, res) {
    Model.editImageTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.delete('/image-track/delete', function (req, res) {
    Model.deleteImageTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

module.exports = router;