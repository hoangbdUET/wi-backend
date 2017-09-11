var express = require('express');
var router = express.Router();
var shadingModel = require('./shading.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/shading/info', function (req, res) {
    shadingModel.getShadingInfo(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});
router.post('/shading/new', function (req, res) {
    shadingModel.createNewShading(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});
router.post('/shading/edit', function (req, res) {
    shadingModel.editShading(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});
router.delete('/shading/delete', function (req, res) {
    shadingModel.deleteShading(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

module.exports = router;