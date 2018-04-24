'use strict';
const fs = require('fs');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let path = require('path');
let curveModel = require('./curve.model');

router.use(bodyParser.json());

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({storage: storage});

router.post('/curve/copy', (req, res) => {
    curveModel.copyCurve(req.body, (status) => {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
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

router.post('/curve/info', function (req, res) {
    //console.log("Get info");
    curveModel.getCurveInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/curve/new', function (req, res) {
    curveModel.createNewCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)

});

router.post('/curve/edit', function (req, res) {
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
        res.send(code);
    }, req.dbConnection, req.decoded.username)
});

router.post('/curve/getData', function (req, res) {
    curveModel.getData(req.body, function (resultStream) {
        if (resultStream) {
            res.setHeader('content-type', 'text/javascript');
            resultStream.pipe(res);
        }
    }, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

function writeToTmpFile(data, callback) {
    let name = Date.now();
    let tmpPath = path.join(__dirname, name + '.txt');
    let text = new String();
    let count = 0;
    data.forEachDone(function (row) {
        text += (count++ + " " + row + "\n");
    }, function () {
        fs.writeFileSync(tmpPath, text);
        callback(tmpPath);
    });
}

router.post('/curve/scale', function (req, res) {
    curveModel.getScale(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/curve/processing', upload.single('file'), function (req, res) {
    // console.log("====", req.createdBy);
    // console.log("====", req.updatedBy);
    writeToTmpFile(req.body.data, function (tmpPath) {
        req.tmpPath = tmpPath;
        curveModel.processingCurve(req, function (result) {
            res.send(result);
        }, req.dbConnection, req.createdBy, req.updatedBy);
    });
});

router.post('/curve/import-from-inventory', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    curveModel.getCurveDataFromInventory(req.body, token, function (err, successful) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done", successful))
        }
    }, req.dbConnection, req.decoded.username);
});

router.post('/curve/duplicate', function (req, res) {
    curveModel.duplicateCurve(req.body, function (done) {
        res.send(done);
    }, req.dbConnection, req.decoded.username);
});

router.post('/curve/is-existed', function (req, res) {
    curveModel.checkCurveExisted(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/curve/get-parents', function (req, res) {
    curveModel.getCurveParents(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/curve/convert-unit', function (req, res) {
    curveModel.converUnit(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.username)
});

module.exports = router;
