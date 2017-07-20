'use strict';

let express = require('express');
let router = express.Router();
let lineModel = require('./line.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/line/info', function (req, res) {
    lineModel.getLineInfo(req.body, function (status) {
        res.send(status);
    });
});

router.post('/line/new', function (req, res) {
    lineModel.createNewLine(req.body, function(status) {
        res.send(status);
    });
});

router.post('/line/edit', function (req, res) {
    lineModel.editLine(req.body, function (status) {
        res.send(status);
    });
});

router.delete('/line/delete', function (req, res) {
    lineModel.deleteLine(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;

