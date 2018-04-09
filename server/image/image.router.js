let express = require('express');
let router = express.Router();
let imageModel = require('./image.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/image/info', function (req, res) {
    imageModel.getImageInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/image/new', function (req, res) {
    imageModel.createNewImage(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/image/edit', function (req, res) {
    imageModel.editImage(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.delete('/image/delete', function (req, res) {
    //TODO : Hooks after delete
    imageModel.deleteImage(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

module.exports = router;