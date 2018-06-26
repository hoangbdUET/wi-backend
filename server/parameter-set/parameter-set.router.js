const express = require('express');
let router = express.Router();
let model = require('./parameter-set.model');

router.post('/parameter-set/new', function (req, res) {
    model.createNewParameterSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.post('/parameter-set/info', function (req, res) {
    model.infoParameterSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.post('/parameter-set/list', function (req, res) {
    model.listParameterSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.post('/parameter-set/edit', function (req, res) {
    model.updateParameterSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.delete('/parameter-set/delete', function (req, res) {
    model.deleteParameterSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;