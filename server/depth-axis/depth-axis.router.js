
var express = require('express');
var router = express.Router();
var depthAxisModel = require('./depth-axis.model');
var bodyParserr = require('body-parser');

router.use(bodyParserr.json());
router.post('/depth-axis/info', function (req, res) {
    depthAxisModel.getDepthAxisInfo(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/depth-axis/new', function (req, res) {
    //console.log(req.body);
    depthAxisModel.createNewDepthAxis(req.body,function (status) {
        res.send(status);
    },req.dbConnection);
});
router.post('/depth-axis/edit', function (req, res) {
	depthAxisModel.editDepthAxis(req.body, function (status) {
		res.send(status);
	},req.dbConnection)
});
router.delete('/depth-axis/delete', function (req, res) {
    depthAxisModel.deleteDepthAxis(req.body,function (status) {
        res.send(status);
    },req.dbConnection)

});

module.exports = router;
