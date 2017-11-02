var express = require('express');
var router = express.Router();
var model = require('./user.model');
var bodyParser = require('body-parser');
router.use(bodyParser.json());

router.post('/user/list', function (req, res) {
    model.listUser({}, function (status) {
        res.send(status);
    });
});

router.post('/user/new', function (req, res) {
    model.createUser(req.body, function (status) {
        res.send(status);
    });
});

router.post('/user/info', function (req, res) {
    model.infoUser(req.body, function (status) {
        res.send(status);
    });
});

router.post('/user/edit', function (req, res) {
    model.editUser(req.body, function (status) {
        res.send(status);
    });
});

router.post('/user/delete', function (req, res) {
    model.deleteUser(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;