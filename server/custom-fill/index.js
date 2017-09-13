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
    //appendFileSync
    let command = "";
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
    if (exists) {
        fs.writeFileSync(dataFile, JSON.stringify(oldData));
    } else {
        oldData.push(newFill);
        fs.writeFileSync(dataFile, JSON.stringify(oldData));
    }
    res.send(ResponseJSON(errorCodes.CODES.SUCCESS, command, newFill));
});

router.post('/all', (req, res) => {
    let data = require('./data.json');
    res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", data));
});
module.exports = router;