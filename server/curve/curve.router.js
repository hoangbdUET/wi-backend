
var express = require('express');
var router = express.Router();
var curveModel = require('../models/curve.model');


router.get('/well', function (req, res) {

});
router.post('/well/new', function (req, res) {
    curveModel.createNewCurve();

});
router.post('/well/edit', function (req, res) {
    curveModel.editCurve();
});
router.delete('/well/delete', function (req, res) {
    curveModel.deleteCurve();
});

module.exports = router;