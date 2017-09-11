var express = require('express');
var router = express.Router();
var trackModel = require('./track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/track/info', function (req, res) {
    trackModel.getTrackInfo(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/track/new', function (req, res) {
    trackModel.createNewTrack(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/track/edit', function (req, res) {
    trackModel.editTrack(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.delete('/track/delete', function (req, res) {
    trackModel.deleteTrack(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});


module.exports = router;
