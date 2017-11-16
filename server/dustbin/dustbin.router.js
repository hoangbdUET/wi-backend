var express = require('express');
var router = express.Router();
var dustbinModel = require('./dustbin.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/dustbin', function (req, res) {
    dustbinModel.getDustbin(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/dustbin/delete', function (req, res) {
    dustbinModel.deleteObject(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/dustbin/restore', function (req, res) {
    dustbinModel.restoreObject(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
})
module.exports = router;