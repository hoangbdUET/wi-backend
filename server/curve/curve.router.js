
var express = require('express');
var router = express.Router();
var curveModel = require('../models/curve.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/well', function (req, res) {

});
router.post('/well/new', function (req, res) {
    const result=curveModel.createNewCurve(req.body);
    res.send(result);

});
router.post('/well/edit', function (req, res) {
    const result=curveModel.editCurve(req.body);
    res.send(result);
});
router.delete('/well/delete', function (req, res) {
    const result=curveModel.deleteCurve(req.body);
    res.send(result);
});

module.exports = router;