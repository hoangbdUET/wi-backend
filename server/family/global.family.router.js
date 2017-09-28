var express = require('express');
var router = express.Router();
var familyModel = require('./global.family.models');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/global-family/info', function (req, res) {
    familyModel.getFamilyInfo(req.body, function (status) {
        res.send(status);
    });
});

router.post('/global-family/new', function (req, res) {
    familyModel.createNewFamily(req.body, function (status) {
        res.send(status);
    });
});

router.post('/global-family/edit', function (req, res) {
    familyModel.editFamily(req.body, function (status) {
        res.send(status);
    });
});

router.delete('/global-family/delete', function (req, res) {
    familyModel.deleteFamily(req.body, function (status) {
        res.send(status);
    });
});

router.post('/global-family/list', function (req, res) {
    familyModel.getFamilyList(function (status) {
        res.send(status);
    });
});

router.get('/global-family/list', function (req, res) {
    familyModel.getFamilyList(function (status) {
        res.send(status);
    });
});


module.exports = router;
