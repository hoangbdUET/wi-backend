var express = require('express');
var router = express.Router();
var groupModel = require('./groups.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/group/info', function (req, res) {
    groupModel.getGroupInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/group/new', function (req, res) {
    groupModel.createNewGroup(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/group/edit', function (req, res) {
    groupModel.editGroup(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.delete('/group/delete', function (req, res) {
    groupModel.deleteGroup(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

module.exports = router;