let express = require('express');
let router = express.Router();
let familyModel = require('./family.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/family/info', function (req, res) {
    familyModel.getFamilyInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/family/new', function (req, res) {
    familyModel.createNewFamily(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/family/edit', function (req, res) {
    familyModel.editFamily(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/family/delete', function (req, res) {
    familyModel.deleteFamily(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/family/list', function (req, res) {
    familyModel.getFamilyList(function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/family/update-spec', function (req, res) {
    familyModel.editFamilySpec(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
