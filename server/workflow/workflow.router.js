"use strict";

let workflowModel = require('./workflow.model');
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let path = require('path');
let fs = require('fs');

router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

function writeToTmpFile(data, callback, type) {
    let time = Date.now();
    let tmpPath = path.join(__dirname, type + '_' + time + '.txt');
    fs.writeFileSync(tmpPath, JSON.stringify(data));
    callback(tmpPath);
}

router.post('/workflow/list', function (req, res) {
    workflowModel.listWorkflow(req.body, function (done) {
        res.send(done);
    }, req.dbConnection, req.decoded.username);
});

router.post('/workflow/new', function (req, res) {
    writeToTmpFile(req.body.content, function (tmpContentPath) {
        req.body.content = tmpContentPath;
        workflowModel.createWorkflow(req.body, function (done) {
            res.send(done);
        }, req.dbConnection, req.decoded.username);
    }, 'WORKFLOW_CONTENT');
});

router.post('/workflow/edit', function (req, res) {
    writeToTmpFile(req.body.content, function (tmpContentPath) {
        req.body.content = tmpContentPath;
        workflowModel.editWorkflow(req.body, function (done) {
            res.send(done);
        }, req.dbConnection, req.decoded.username);
    }, 'WORKFLOW_CONTENT');
});

router.post('/workflow/info', function (req, res) {
    workflowModel.infoWorkflow(req.body, function (done) {
        res.send(done);
    }, req.dbConnection, req.decoded.username);
});

router.delete('/workflow/delete', function (req, res) {
    workflowModel.deleteWorkflow(req.body, function (done) {
        res.send(done);
    }, req.dbConnection, req.decoded.username);
});

module.exports = router;
