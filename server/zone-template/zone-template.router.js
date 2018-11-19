let express = require('express');
let router = express.Router();
let zoneTempModel = require('./zone-template.model');

router.post('/zone-set-template/zone-template/list', function (req, res) {
    zoneTempModel.listZoneTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-set-template/zone-template/new', function (req, res) {
    zoneTempModel.newZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-set-template/zone-template/edit', function (req, res) {
    zoneTempModel.editZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/zone-set-template/zone-template/delete', function (req, res) {
    zoneTempModel.deleteZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;