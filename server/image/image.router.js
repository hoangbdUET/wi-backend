var express = require('express');
var router = express.Router();
var imageModel = require('./image.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/image/info', function (req, res) {
    imageModel.getImageInfo(req.body, function (status) {
        res.send(status);
    })
});

router.post('/image/new', function (req, res) {
    imageModel.createNewImage(req, body, function (status) {
        res.send(status);
    })
});

router.post('/image/edit', function (req, res) {
    imageModel.editImage(req.body,function (status) {
        res.send(status);
    })
});

router.delete('/image/delete', function (req, res) {
    imageModel.deleteImage(req.body, function (status) {
        res.send(status);
    })
});

module.exports = router;