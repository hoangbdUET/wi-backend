"use strict";
const express = require('express');
const router = express.Router();
const logViewModel = require('./log-view.model');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/view-by-user', (req, res) => {
  logViewModel.viewByUserName(req.decoded.username, respData => res.send(respData))
});

router.post('/view-by-object', (req, res) => {
  logViewModel.viewByObject(req.body, respData => res.send(respData))
});

module.exports = router;