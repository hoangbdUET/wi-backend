"use strict";
var express = require('express');
var router = express.Router();
var userDefineLineModel = require('./user-line.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/user-define-line/new', function (req, res) {
    userDefineLineModel.createNewUserDefineLine(req.body, function (done) {
        res.send(done);
    },req.dbConnection);
});

router.post('/user-define-line/info', function (req, res) {
    userDefineLineModel.infoUserDefineLine(req.body, function (done) {
        res.send(done);
    },req.dbConnection);
});

router.post('/user-define-line/edit', function (req, res) {
    userDefineLineModel.editUserDefineLine(req.body, function (done) {
        res.send(done);
    },req.dbConnection);
});

router.delete('/user-define-line/delete', function (req, res) {
    userDefineLineModel.deleteUserDefineLine(req.body, function (done) {
        res.send(done);
    },req.dbConnection);
});

module.exports = router;
