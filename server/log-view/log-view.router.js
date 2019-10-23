"use strict";
const express = require('express');
const router = express.Router();
const logViewModel = require('./log-view.model');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/view-by-user', (req, res) => {
    logViewModel.viewByUserName(req.decoded.username, respData => res.send(respData), req.token, req.get('CurrentProject'));
});

router.post('/view-by-object', (req, res) => {
    logViewModel.viewByObject(req.body, respData => res.send(respData), req.token, req.get('CurrentProject'));
});

router.post('/put-log', (req, res) => {
    logViewModel.putLog(req.body, data => res.send(data), req.decoded.username);
});

module.exports = router;