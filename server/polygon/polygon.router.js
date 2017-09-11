var express = require('express');
var router = express.Router();
var polygonModel = require('./polygon.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/polygon/info', function (req, res) {
    polygonModel.getPolygonInfo(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/polygon/new', function (req, res) {
    polygonModel.createNewPolygon(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/polygon/edit', function (req, res) {
    polygonModel.editPolygon(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.delete('/polygon/delete', function (req, res) {
    polygonModel.deletePolygon(req.body, function (status) {
        res.send(status);
    },req.dbConnection)
});

module.exports = router;

