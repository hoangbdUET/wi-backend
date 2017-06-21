
var express = require('express');
var router = express.Router();
var depthAxisModel = require('../models/depth-axis.model');
var bodyParserr = require('body-parser');

router.use(bodyParserr.json());
router.get('/depth-axis', function (req, res) {

});
router.post('/depth-axis/new', function (req, res) {
    const result=depthAxisModel.createNewDepthAxis(req.body);
    res.send(result);
});
router.delete('/depth-axis/delete', function (req, res) {
    const result=depthAxisModel.deleteDepthAxis(req.body);
    res.send(result);

});

module.exports = router;