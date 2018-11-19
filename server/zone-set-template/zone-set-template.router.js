let express = require('express');
let router = express.Router();
let zoneSetTemplateModel = require('./zone-set-template.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/zone-set-template/new', function (req, res) {
    zoneSetTemplateModel.createNewZoneSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.post('/zone-set-template/info', function (req, res) {
    zoneSetTemplateModel.infoZoneSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.post('/zone-set-template/list', function (req, res) {
    zoneSetTemplateModel.listZoneSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.post('/zone-set-template/edit', function (req, res) {
    zoneSetTemplateModel.editZoneSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.delete('/zone-set-template/delete', function (req, res) {
    zoneSetTemplateModel.deleteZoneSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
