const express = require('express');
let router = express.Router();
let model = require('./marker-template.model');

router.post('/marker-set-template/marker-template/new', function (req, res) {
    model.createNewMarkerTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/marker-set-template/marker-template/info', function (req, res) {
    model.infoMarkerTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/marker-set-template/marker-template/list', function (req, res) {
    model.allMarkerTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/marker-set-template/marker-template/edit', function (req, res) {
    model.editMarkerTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/marker-set-template/marker-template/delete', function (req, res) {
    model.deleteMarkerTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});


module.exports = router;