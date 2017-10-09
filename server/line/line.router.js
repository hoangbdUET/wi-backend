'use strict';

let express = require('express');
let router = express.Router();
let lineModel = require('./line.model');
let bodyParser = require('body-parser');
let Line = require('../models').Line;

router.use(bodyParser.json());

router.registerHooks = function (io) {
    // TODO: register hooks to Line model here. Hook callback function should use "io" parameter for send info back to clients
    Line.addHook('afterUpdate', 'afterLineUpdate', function (line) {
        console.log('afterLineUpdate');
        io.emit('line-change', line.toJSON());
    });
};

router.post('/line/info', function (req, res) {
    lineModel.getLineInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/line/new', function (req, res) {
    lineModel.createNewLine(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/line/edit', function (req, res) {
    lineModel.editLine(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/line/delete', function (req, res) {
    lineModel.deleteLine(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;

