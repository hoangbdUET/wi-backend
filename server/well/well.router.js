'use strict';

let express = require('express');
let router = express.Router();
let wellModel = require('./well.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/well/info', function (req, res) {
    wellModel.getWellInfo(req.body, function (status) {
        res.send(status);
    });
});

router.post('/well/new', function (req, res) {
    wellModel.createNewWell(req.body, function(status) {
        res.send(status);
    });
});

router.post('/well/edit', function (req, res) {
    wellModel.editWell(req.body, function (status) {
        res.send(status);
    });
});

router.delete('/well/delete', function (req, res) {
    wellModel.deleteWell(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;
