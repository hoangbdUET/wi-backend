"use strict";

let taskModel = require('./task.model');
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
router.use(bodyParser.json({limit: '5mb'}));

router.post('/task/list', function (req, res) {
    taskModel.listTask(req.body, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.post('/task/new', function (req, res) {
    req.body.content = req.body.content || "{}";
    taskModel.createTask(req.body, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.post('/task/edit', function (req, res) {
    req.body.content = req.body.content || "{}";
    taskModel.editTask(req.body, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.post('/task/info', function (req, res) {
    taskModel.infoTask(req.body, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.delete('/task/delete', function (req, res) {
    taskModel.deleteTask(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;
