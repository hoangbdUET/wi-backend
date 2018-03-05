"use strict";

let workflowSpecModel = require('./workflow-spec.model');
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
router.use(bodyParser.json());

router.post('/workflow-spec/list', function (req, res) {
    workflowSpecModel.listWorkflowSpec(req.body, function (done) {
        res.send(done);
    }, req.dbConnection);
});

router.post('/workflow-spec/new', function (req, res) {
    req.body.content = req.body.content || "{}";
    workflowSpecModel.createWorkflowSpec(req.body, function (done) {
        res.send(done);
    }, req.dbConnection)
});

router.post('/workflow-spec/edit', function (req, res) {
    req.body.content = req.body.content || "{}";
    workflowSpecModel.editWorkflowSpec(req.body, function (done) {
        res.send(done);
    }, req.dbConnection)
});

router.post('/workflow-spec/info', function (req, res) {
    workflowSpecModel.infoWorkflowSpec(req.body, function (done) {
        res.send(done);
    }, req.dbConnection)
});

router.delete('/workflow-spec/delete', function (req, res) {
    workflowSpecModel.deleteWorkflowSpec(req.body, function (done) {
        res.send(done);
    }, req.dbConnection)
});

module.exports = router;