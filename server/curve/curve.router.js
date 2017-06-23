'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

let curveModel = require('../models/curve.model');

router.use(bodyParser.json());

router.get('/well', function (req, res) {

});
router.post('/well/new', function (req, res) {
    // const result=curveModel.createNewCurve(req.body);
    // res.send(result);


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