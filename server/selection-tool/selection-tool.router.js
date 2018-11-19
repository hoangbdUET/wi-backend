let express = require('express');
let router = express.Router();
let fs = require('fs');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
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

router.post('/selection-tool/new', upload.array(), function (req, res) {
	console.log("===================", req.body.data);
    writeToTmpFile(req.body.data, function (tmpPath) {
        req.body.BIN = tmpPath;
        req.body.createdBy = req.createdBy;
        req.body.updatedBy = req.updatedBy;
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

router.post('/selection-tool/edit', upload.array(), function (req, res) {
    req.body.createdBy = req.createdBy;
	req.body.updatedBy = req.updatedBy;
	console.log(req.body.data);
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
