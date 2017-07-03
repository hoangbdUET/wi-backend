
var express = require('express');
var router = express.Router();
var plotModel = require('./plot.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/plot', function (req, res) {
    plotModel.getPlotInfo(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })

});
router.post('/plot/new', function (req, res) {
    plotModel.creatNewPlot(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});
router.post('/plot/edit', function (req, res) {
    plotModel.editPlot(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});
router.delete('/plot/delete', function (req, res) {
    plotModel.deletePlot(req.body, function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});

module.exports = router;