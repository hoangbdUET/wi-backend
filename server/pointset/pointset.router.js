var express = require('express');
var router = express.Router();
var pointSetModel = require('./pointset.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/point-set/info', function (req, res) {
    pointSetModel.getPointSetInfo(req.body, function (status) {
        res.send(status);
    })
});

router.post('/point-set/new', function (req, res) {
    pointSetModel.createNewPointSet(req.body, function (status) {
        res.send(status);
    })
});

router.post('/point-set/edit', function (req, res) {
    pointSetModel.editPointSet(req.body, function (status) {
        res.send(status);
    });
});

router.delete('/point-set/delete', function (req, res) {
    pointSetModel.deletePointSet(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;