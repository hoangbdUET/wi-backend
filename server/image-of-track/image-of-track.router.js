var express = require('express');
var router = express.Router();
var Model = require('./image-of-track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/image/info', function (req, res) {
    Model.infoImageOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/image/new', function (req, res) {
    Model.createImageOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/image/edit', function (req, res) {
    Model.editImageOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.delete('/image/delete', function (req, res) {
    Model.deleteImageOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username)
});

router.post('/image/list', function (req, res) {
    Model.getListImage(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;