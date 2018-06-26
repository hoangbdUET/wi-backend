let express = require('express');
let router = express.Router();
let histogramModel = require('./histogram.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/histogram/new', function (req, res) {
    if (req.body.idCurve == null || !req.body.idCurve) delete req.body.idCurve;
    histogramModel.createNewHistogram(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/histogram/info', function (req, res) {
    histogramModel.getHistogram(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/histogram/edit', function (req, res) {
    histogramModel.editHistogram(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/histogram/delete', function (req, res) {
    histogramModel.deleteHistogram(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/histogram/duplicate', function (req, res) {
    histogramModel.duplicateHistogram(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.post('/histogram/histogram-curve-set/edit', function (req, res) {
    histogramModel.editHistogramCurveSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;