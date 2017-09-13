"use strict";
const express = require('express');
const config = require('config');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

let dataFile = path.join(__dirname, 'data.json');
let errorCodes = require('../../error-codes');
let ResponseJSON = require('../response');
let router = express.Router();
let bodyParser = require('body-parser');
router.use(cors());

router.post('/save', (req, res) => {
    //appendFileSync if exists
    let newFill = new Object();
    let exists = false;
    newFill.name = req.body.name;
    newFill.content = req.body.content;
    let oldData = require('./data.json');
    oldData.forEach(function (data) {
        if (data.name == newFill.name) {
            data.content = newFill.content;
            exists = true;
        }
    });
    if (!exists) {
        oldData.push(newFill);
        fs.writeFileSync(dataFile, JSON.stringify(oldData));
        res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Added new custom-fill", newFill));
    } else {
        fs.writeFileSync(dataFile, JSON.stringify(oldData));
        res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Updated custom-fill", newFill));
    }
});

router.post('/all', (req, res) => {
    let data = require('./data.json');
    res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", data));
});

router.post('/clear', (req, res) => {
    let data = new Array();
    fs.writeFileSync(dataFile, JSON.stringify(data));
    res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Clear data successfull"));
});

module.exports = router;