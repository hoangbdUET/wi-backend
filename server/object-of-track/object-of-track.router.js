var express = require('express');
var router = express.Router();
var Model = require('./object-of-track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/object/info', function (req, res) {
    Model.infoObjectOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/object/new', function (req, res) {
    Model.createObjectOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/object/edit', function (req, res) {
    Model.editObjectOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.delete('/object/delete', function (req, res) {
    Model.deleteObjectOfTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

module.exports = router;