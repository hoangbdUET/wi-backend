var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());

var Model = require('./combo-box-select.model');
router.post('/combo-box-select/new', function (req, res) {
    Model.createNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/combo-box-select/info', function (req, res) {
    Model.infoComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/combo-box-select/edit', function (req, res) {
    Model.editNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/combo-box-select/delete', function (req, res) {
    Model.deleteNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/combo-box-select/list', function (req, res) {
    Model.listNewComboBoxSelect(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;