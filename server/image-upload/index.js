'use strict';
const express = require('express');
const config = require('config');
const path = require('path');

const cors = require('cors');
const fs = require('fs');
const formidable = require('formidable');
let ResponseJSON = require('../response');
let errorCodes = require('../../error-codes');
let hashDir = require('../utils/data-tool').hashDir; // hashDir.createPath();
let Finder = require('fs-finder');
let asyncEach = require('async/each');

let router = express.Router();
// let saveDir = path.join(__dirname, '../..', config.imageBasePath);
let saveDir = config.imageBasePath;


router.use(cors());

router.post('/image-list', function (req, res) {
    let savePath = path.join(saveDir, req.decoded.username);
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
        res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", []));
    } else {
        Finder.from(savePath).findFiles('*', function (files) {
            let rs = [];
            asyncEach(files, function (file, next) {
                file = file.replace(saveDir, ' ').trim();
                rs.push(file);
                next();
            }, function () {
                res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", rs));
            });
        });
    }
});

router.post('/image-upload', imageUpload);


function imageUpload(req, res) {
    //console.log("DIR NAME : " + saveDir);
    let savePath = saveDir + "/" + req.decoded.username;
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }

    var form = new formidable.IncomingForm();
    form.multiples = false;
    form.uploadDir = config.imageBasePath;

    form.on('end', function () {

    });

    form.on('field', function (name, value) {

    });
    form.on('file', function (name, file) {
        let fileHashDir = hashDir.createPath(savePath, file.path, file.name);
        fs.rename(file.path, fileHashDir, function (err) {
            if (err) {
                console.log(err);
                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Upload image failed!', '/NaN')));
            } else {
                let fileDir = "/" + req.decoded.username + fileHashDir.replace(savePath, '');
                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, "Upload success", fileDir)));
            }
        });
    });
    form.on('error', function (err) {

    });

    form.parse(req);

}

module.exports = router;