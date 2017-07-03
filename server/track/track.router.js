var express = require('express');
var router = express.Router();
var trackModel = require('./track.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/track', function (req, res) {


});
router.post('/track/new', function (req, res) {
    trackModel.createTrack(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});
router.delete('/track/delete', function (req, res) {
    trackModel.deleteTrack(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});

module.exports = router;
