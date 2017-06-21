var express = require('express');
var router = express.Router();
var trackModel = require('../models/track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/track', function (req, res) {


});
router.post('/track/new', function (req, res) {
    const result=trackModel.createTrack(req.body);
    res.send(result);
});
router.delete('/track/delete', function (req, res) {
    const result=trackModel.deleteTrack(req.body);
    res.send(result);
});

module.exports = router;
