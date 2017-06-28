'use strict';
const express = require('express');
const multer  = require('multer');
const cors = require('cors');
let wlogExtract = require('../models/WellLogImport/wlog-extractor');
var router = express.Router();
let inDir = __dirname + '../../uploads/';
router.use(cors());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({ storage: storage });

router.post('/file', upload.single('file'), function (req, res) {
    console.log(req.file);
    console.log(req.body);
    console.log('-----------------------------');
    // console.log(inDir + req.file.filename);
    // wlogExtract(inDir + req.file.filename);
    return res.end(JSON.stringify(req.file));
});

module.exports = router;