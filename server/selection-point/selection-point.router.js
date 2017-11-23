var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var selectionPointModel = require('./selection-point.model');
router.use(bodyParser.json());

function writeToTmpFile(data, callback, type) {
    let tmpPath = path.join(__dirname, type + '_tmp.txt');
    let text = new String();
    let count = 0;
    data.forEachDone(function (row) {
        text += (count++ + " " + row + "\n");
    }, function () {
        fs.writeFileSync(tmpPath, text);
        callback(tmpPath);
    });
}

router.post('/selection-point/new', function (req, res) {
    req.PointsPath = null;
    writeToTmpFile(req.body.Points, function (tmpPath) {
        req.PointsPath = tmpPath;
        selectionPointModel.createSelectionPoint(req, function (status) {
            res.send(status);
        }, req.dbConnection);
    }, 'Points');
});

router.post('/selection-point/getData', function (req, res) {
    selectionPointModel.getDataSelectionPoint(req, function (result) {
        if (result === "NO_ROW") {
            res.status(200).send({
                code: 500,
                reason: "No selection point found!",
                content: null
            });
        } else if (result === "ERR") {
            res.status(200).send({
                code: 500,
                reason: "Some Error",
                content: null
            });
        } else {
            if (result) {
                res.setHeader('content-type', 'text/javascript');
                result.pipe(res);
            } else {
                res.status(200).send({
                    code: 500,
                    reason: "No streaming",
                    content: null
                });
            }
        }
    }, req.dbConnection);
});

router.post('/selection-point/info', function (req, res) {
    selectionPointModel.infoSelectionPoint(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/selection-point/edit', function (req, res) {
    writeToTmpFile(req.body.Points, function (tmpPath) {
        req.PointsPath = tmpPath;
        selectionPointModel.editSelectionPoint(req, function (status) {
            res.send(status);
        }, req.dbConnection);
    }, 'Points');
});

router.delete('/selection-point/delete', function (req, res) {
    selectionPointModel.deleteSelectionPoint(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;