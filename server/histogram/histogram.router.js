var express = require('express');
var router = express.Router();
var histogramModel = require('./histogram.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/histogram/new', function (req, res) {
    histogramModel.createNewHistogram(req.body, function (status) {
        res.send(status);
    });
});

router.post('/histogram/info', function (req, res) {
    histogramModel.getHistogram(req.body, function (status) {
        res.send(status);
    });
});

router.post('/histogram/all', function (req, res) {
    histogramModel.getAllHistogram(function (status) {
        res.send(status);
    })
});


module.exports = router;