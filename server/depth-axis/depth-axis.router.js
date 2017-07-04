
var express = require('express');
var router = express.Router();
var depthAxisModel = require('./depth-axis.model');
var bodyParserr = require('body-parser');

router.use(bodyParserr.json());
router.post('/depth-axis/info', function (req, res) {
    depthAxisModel.getDepthAxisInfo(req.body,function (status) {
        res.send(status);
    })
});
router.post('/depth-axis/new', function (req, res) {
    depthAxisModel.createNewDepthAxis(req.body,function (status) {
        res.send(status);
    });
});
router.delete('/depth-axis/delete', function (req, res) {
    depthAxisModel.deleteDepthAxis(req.body,function (status) {
        res.send(status);
    })

});

module.exports = router;