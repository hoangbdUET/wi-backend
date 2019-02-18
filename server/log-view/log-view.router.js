"use strict";
const express = require('express');
const router = express.Router();
const logViewModel = require('./log-view.model');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/view-by-username', (req, res) => {
  logViewModel.viewByUserName(req.body.username, respData => res.send(respData))
});

router.post('/view-by-object', (req, res) => {
  logViewModel.viewByTaskname(req.body.taskName, respData => res.send(respData))
});

module.exports = router;