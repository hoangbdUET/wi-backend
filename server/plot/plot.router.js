
var express = require('express');
var router = express.Router();
var plotModel = require('../models/plot.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.get('/plot', function (req, res) {

});
router.post('/plot/new', function (req, res) {
    const result=plotModel.creatNewPlot(req.body);
    res.send(result);
});
router.post('/plot/edit', function (req, res) {
    const result=plotModel.editPlot(body.body);
    res.send(result);
});
router.delete('/plot/delete',function (req, res) {

    const result=plotModel.deletePlot(body.body);
    res.send(result);
})

module.exports = router;