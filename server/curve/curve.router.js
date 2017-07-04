'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

let curveModel = require('./curve.model');

router.use(bodyParser.json());

router.get('/curve/info', function (req, res) {

});
router.post('/curve/new', function (req, res) {
    curveModel.createNewCurve(req.body,function (status) {
        res.send(status);
    })

});
router.post('/curve/edit', function (req, res) {
    curveModel.editCurve(req.body,function (status) {
        res.send(status);
    })

});
router.delete('/curve/delete', function (req, res) {
    curveModel.deleteCurve(req.body,function (status) {
        res.send(status);
    })
});

module.exports = router;