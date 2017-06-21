
var express = require('express');
var router = express.Router();
var plotModel = require('../models/plot.model');

router.get('/plot', function (req, res) {

});
router.post('/plot/new', function (req, res) {
    plotModel.creatNewPlot();
});
router.post('/plot/edit', function (req, res) {
    plotModel.editPlot();
});
router.delete('/plot/delete',function (req, res) {
    plotModel.deletePlot();
})

module.exports = router;