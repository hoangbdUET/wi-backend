"use strict";

let taskModel = require('./task.model');
let express = require('express');
let router = express.Router();
const {gzip, ungzip} = require('node-gzip');

router.post('/task/list', function (req, res) {
    taskModel.listTask(data, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.post('/task/new', function (req, res) {
	console.log("hihihihihihihihihi");
    ungzip(Uint8Array.from(req.body.content.data)).then(content => {
        req.body.content = JSON.parse(content.toString());
        taskModel.createTask(req.body, function (done) {
            res.send(done);
        }, req.dbConnection);
    });
});

router.post('/task/edit', function (req, res) {
    ungzip(Uint8Array.from(req.body.content.data)).then(content => {
        req.body.content = JSON.parse(content.toString());
        taskModel.editTask(req.body, function (done) {
            res.send(done);
        }, req.dbConnection);
    });
});

router.post('/task/info', function (req, res) {
    taskModel.infoTask(req.body, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.delete('/task/delete', function (req, res) {
    taskModel.deleteTask(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
