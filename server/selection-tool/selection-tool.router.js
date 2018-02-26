let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let selectionPointModel = require('./selection-tool.model');
router.use(bodyParser.json());

router.post('/selection-tool/new', function (req, res) {
    selectionPointModel.createSelectionTool(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/selection-tool/info', function (req, res) {
    selectionToolModel.infoSelectionTool(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/selection-tool/edit', function (req, res) {
    selectionToolModel.editSelectionTool(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/selection-tool/delete', function (req, res) {
    selectionToolModel.deleteSelectionTool(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;