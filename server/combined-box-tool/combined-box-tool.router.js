var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());

var Model = require('./combined-box-tool.model');
router.post('/tool/new', function (req, res) {
    Model.createNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/tool/info', function (req, res) {
    Model.infoComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/tool/edit', function (req, res) {
    Model.editNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/tool/delete', function (req, res) {
    Model.deleteNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/tool/list', function (req, res) {
    Model.listNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;