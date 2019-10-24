let express = require('express');
let router = express.Router();
let zoneSetModel = require('./zone-set.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/zone-set/info', function (req, res) {
    zoneSetModel.getZoneSetInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/zone-set/new', function (req, res) {
    zoneSetModel.createNewZoneSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/zone-set/edit', function (req, res) {
    zoneSetModel.editZoneSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.delete('/zone-set/delete', function (req, res) {
    zoneSetModel.deleteZoneSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/zone-set/list', function (req, res) {
    zoneSetModel.getZoneSetList(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-set/duplicate', function (req, res) {
    zoneSetModel.duplicateZoneSet(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
