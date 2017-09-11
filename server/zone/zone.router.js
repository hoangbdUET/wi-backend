var express = require('express');
var router = express.Router();
var zoneModel = require('./zone.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/zone/info', function (req, res) {
    zoneModel.getZoneInfo(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/zone/new', function (req, res) {
    zoneModel.createNewZone(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/zone/edit', function (req, res) {
    zoneModel.editZone(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.delete('/zone/delete', function (req, res) {
    zoneModel.deleteZone(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});


module.exports = router;
