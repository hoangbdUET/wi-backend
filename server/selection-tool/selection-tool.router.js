let express = require('express');
let router = express.Router();
let fs = require('fs');
let bodyParser = require('body-parser');
let selectionToolModel = require('./selection-tool.model');
let path = require('path');
router.use(bodyParser.json());

function writeToTmpFile(data, callback, type) {
    // console.log(data);
    let time = Date.now();
    let tmpPath = path.join(__dirname, type + '_' + time + '.txt');
    fs.writeFileSync(tmpPath, JSON.stringify(data));
    callback(tmpPath);
}

router.post('/selection-tool/new', function (req, res) {
    writeToTmpFile(req.body.data, function (tmpPath) {
        req.body.BIN = tmpPath;
        selectionToolModel.createSelectionTool(req.body, function (status) {
            res.send(status);
        }, req.dbConnection, req.decoded.username);
    }, 'BIN');
});

router.post('/selection-tool/info', function (req, res) {
    selectionToolModel.infoSelectionTool(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/selection-tool/edit', function (req, res) {
    if (req.body.data) {
        writeToTmpFile(req.body.data, function (tmpPath) {
            req.body.BIN = tmpPath;
            selectionToolModel.editSelectionTool(req.body, function (status) {
                res.send(status);
            }, req.dbConnection, req.decoded.username);
        }, 'BIN');
    } else {
        selectionToolModel.editSelectionTool(req.body, function (status) {
            selectionToolModel.infoSelectionTool(req.body, function (status) {
                res.send(status);
            }, req.dbConnection, req.decoded.username);
        }, req.dbConnection, req.decoded.username);
    }
});

router.delete('/selection-tool/delete', function (req, res) {
    selectionToolModel.deleteSelectionTool(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

module.exports = router;