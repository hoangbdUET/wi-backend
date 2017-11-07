'use strict';
const fs = require('fs');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const config = require('config');
var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;
var path = require('path');
var asyncLoop = require('async/each');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
let curveModel = require('./curve.model');

router.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({storage: storage});


///start curve advance actions
router.post('/curve/copy', (req, res) => {
    console.log(req.body);
    curveModel.copyCurve(req.body, (status) => {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
    //res.send("Copy curve");
});

router.post('/curve/move', (req, res) => {
    console.log(req.body);
    curveModel.moveCurve(req.body, (status) => {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.delete('/curve/delete', function (req, res) {
    console.log(req.body);
    curveModel.deleteCurve(req.body, (status) => {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});
///end curve advance actions
router.post('/curve/info', function (req, res) {
    //console.log("Get info");
    curveModel.getCurveInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});
router.post('/curve/new', function (req, res) {
    //console.log("Create curve");
    curveModel.createNewCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)

});
router.post('/curve/edit', function (req, res) {
    //console.log("Edit curve");
    curveModel.editCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username)

});
router.post('/curve/export', function (req, res) {
    curveModel.exportData(req.body, function (code, fileResult) {
        res.status(code).sendFile(fileResult, function (err) {
            if (err) console.log('Export curve: ' + err);
            fs.unlinkSync(fileResult);
        });
    }, function (code) {
        res.status(code).end();
    }, req.dbConnection, req.decoded.username)
});


router.post('/curve/getData', function (req, res) {
    //console.log("Get data");
    // Encode data curve
    /*
    curveModel.getData(req.body, function(err, resultStream) {
        if(err) res.send(err);
        else {
            if(resultStream) {
                res.end(JSON.stringify(ResponseJSON(ErrorCodes.SUCCESS,"Success", resultStream)));
            }
            else res.end(ResponseJSON(ErrorCodes.ERROR_CURVE_DATA_FILE_NOT_EXISTS, "Curve data file does not exist"));
        }
    }, function(status) {
        res.send(status);
    });
    */
    curveModel.getData(req.body, function (resultStream) {
        if (resultStream) resultStream.pipe(res);
    }, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

function writeToTmpFile(data, callback) {
    let tmpPath = path.join(__dirname, 'tmp.txt');
    let text = new String();
    let count = 0;
    data.forEachDone(function (row) {
        text += (count++ + " " + row + "\n");
    }, function () {
        fs.writeFileSync(tmpPath, text);
        callback(tmpPath);
    });
}

router.post('/curve/updateData', upload.single('file'), function (req, res) {
    // console.log(req.data);
    writeToTmpFile(req.body.data, function (tmpPath) {
        req.tmpPath = tmpPath;
        curveModel.updateData(req, function (result) {
            res.send(result);
        });
    });
});

router.post('/curve/scale', function (req, res) {
    curveModel.getScale(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/curve/processing', upload.single('file'), function (req, res) {
    writeToTmpFile(req.body.data, function (tmpPath) {
        req.tmpPath = tmpPath;
        curveModel.processingCurve(req, function (result) {
            res.send(result);
        }, req.dbConnection);
    });
});

module.exports = router;
