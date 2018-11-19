const express = require('express');
let router = express.Router();
let model = require('./marker-set.model');

router.post('/marker-set/new', function (req, res) {
    model.createNewMarkerSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/marker-set/edit', function (req, res) {
    model.editMarkerSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/marker-set/info', function (req, res) {
    model.infoMarkerSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/marker-set/delete', function (req, res) {
    model.deleteMarkerSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/marker-set/list', function (req, res) {
    model.listMarkerSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;