let express = require('express');
let router = express.Router();
let OverlayLineModel = require('./overlay-line.model');

router.post('/overlay-line/all', function (req, res) {
    OverlayLineModel.getAllOverlayLine(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/overlay-line/list', function (req, res) {
    OverlayLineModel.getListOverlayLineByCurves(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/overlay-line/info', function (req, res) {
    OverlayLineModel.getOverlayLine(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
})

module.exports = router;