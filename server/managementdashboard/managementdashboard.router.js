var express = require('express');
var router = express.Router();
var model = require('./managementdashboard.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/marker/new', function (req, res) {
    model.createNew(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

router.post('/marker/info', function (req, res) {
    model.info(req.body, function (status) {
        res.send(status);
    },req.dbConnection)
});

router.post('/marker/edit', function (req, res) {
    model.edit(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

router.delete('/marker/delete', function (req, res) {
    model.delete(req.body, function (status) {
        res.send(status);
    },req.dbConnection);
});

module.exports = router;