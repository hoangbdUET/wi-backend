let express = require('express');
let router = express.Router();
let imageModel = require('./image.model');
let bodyParser = require('body-parser');
let request = require('request');
let config = require('config');

router.use(bodyParser.json());

router.get('/image/thumbnail', (req, res) => {
    imageModel.describeImage(req.query.idImage, req.dbConnection).then((img) => {
        if (!img) return res.status(200).send("Img not found by id");
        let getThumbnail = require('../utils/thumbnail');
        let url = getThumbnail((config.publicAddress || process.env.PUBLIC_ADDRESS) + img.imageUrl, req.query.width, req.query.height, req.query.gravity, req.query.enlarge);
        url = (config.thumbnailService || process.env.THUMBNAIL_SERVICE) + url;
        req.pipe(
            request({
                url,
                method: "GET",
                strictSSL: false
            })
        ).pipe(res);
    });
});

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

router.post('/image/delete', function (req, res) {
    //TODO : Hooks after delete
    imageModel.deleteImage(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

module.exports = router;