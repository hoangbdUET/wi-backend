var express = require('express');
var router = express.Router();
var annotationModel = require('./annotation.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/annotation/new', function (req, res) {
    annotationModel.createNewAnnotation(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/annotation/info', function (req, res) {
    annotationModel.getAnnotationInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/annotation/edit', function (req, res) {
    annotationModel.editAnnotation(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/annotation/delete', function (req, res) {
    annotationModel.deleteAnnotation(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;