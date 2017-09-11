var express = require('express');
var router = express.Router();
var zoneTrackModel = require('./zone-track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/zone-track/info', function (req, res) {
    zoneTrackModel.getZoneTrackInfo(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/zone-track/new', function (req, res) {
    zoneTrackModel.createNewZoneTrack(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/zone-track/edit', function (req, res) {
    zoneTrackModel.editZoneTrack(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.delete('/zone-track/delete', function (req, res) {
    zoneTrackModel.deleteZoneTrack(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});


module.exports = router;

