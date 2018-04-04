const express = require('express');
const router = express.Router();
const dustbinModel = require('./dustbin.model');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/dustbin', function (req, res) {
    dustbinModel.getDustbin(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/dustbin/delete', function (req, res) {
    dustbinModel.deleteObject(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/dustbin/restore', function (req, res) {
    dustbinModel.restoreObject(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});
module.exports = router;