'use strict';

let express = require('express');
let router = express.Router();
let wellModel = require('./well.model');
let bodyParser = require('body-parser');
let wellTopUpdate = require('./well-top-update');
let duplicateWell = require('./duplicate-well');
require('./wellEventListerner');

router.use(bodyParser.json());

router.post('/well/info', function (req, res) {
    wellModel.getWellInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/full-info', function (req, res) {
    wellModel.getWellFullInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/info-by-name', function (req, res) {
    wellModel.getWellInfoByName(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.post('/well/new', function (req, res) {
    wellModel.createNewWell(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/edit', function (req, res) {
    wellModel.editWell(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.delete('/well/delete', function (req, res) {
    wellModel.deleteWell(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/export-to-project', function (req, res) {
    wellModel.exportToProject(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/well/get-well-header', function (req, res) {
    wellModel.getWellHeader(req.body.idWell, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/update-well-header', function (req, res) {
    wellModel.updateWellHeader(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/bulk-update-well-header', function (req, res) {
    wellModel.bulkUpdateWellHeader(req.body.headers, req.body.idWell, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/duplicate', function (req, res) {
    duplicateWell(req.body.idWell, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username, req.createdBy, req.updatedBy);
});

router.post('/well/import-from-inventory', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    wellModel.importWell(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username, token, req.createdBy, req.updatedBy);
});

router.post('/well/well-top-update', function (req, res) {
    wellTopUpdate.executeJob(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/well/list', function (req, res) {
    wellModel.getWellList(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
