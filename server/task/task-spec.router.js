const express = require('express');
let router = express.Router();
let taskSpecModel = require('./task-spec');

router.post('/task-spec/new', function (req, res) {
    taskSpecModel.addTaskSpec(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/task-spec/info', function (req, res) {
    taskSpecModel.infoTaskSpec(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/task-spec/edit', function (req, res) {
    taskSpecModel.editTaskSpec(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/task-spec/list', function (req, res) {
    taskSpecModel.listTaskSpec(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/task-spec/delete', function (req, res) {
    taskSpecModel.deleteTaskSpec(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;