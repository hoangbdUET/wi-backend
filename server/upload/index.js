'use strict';
const express = require('express');
const multer  = require('multer');
const cors = require('cors');

var router = express.Router();

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

    return res.end(JSON.stringify(req.file));
});

module.exports = router;