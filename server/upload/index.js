'use strict';
const express = require('express');
const multer  = require('multer');
const cors = require('cors');
var router = express.Router();
let inDir = __dirname + '../../../uploads/';
let wiImport = require('wi-import');

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

    let list = req.file.filename.split('.');
    let fileFormat = list[list.length - 1];
    if(/LAS/.test(fileFormat.toUpperCase())) {
        wiImport.extractLAS2(inDir + req.file.filename,'idProject', 'idWell', function (result) {
            //do something with result
        });
    }
    else if(/ASC/.test(fileFormat.toUpperCase())) {
        wiImport.extractASC(inDir + req.file.filename, 'idProject', 'idWell', function (result) {
            //do something with result
        });
    }
    else if(/CSV/.test(fileFormat.toUpperCase())) {
        wiImport.extractCSV(inDir + req.file.filename, 'idProject', 'idWell');
    }
    return res.end(JSON.stringify(req.file));
}); //done

module.exports = router;