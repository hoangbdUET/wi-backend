
var express = require('express');
var router = express.Router();
var depthAxisModel = require('../models/depth-axis.model');
var bodyParserr = require('body-parser');

router.use(bodyParserr.json());
router.get('/depth-axis', function (req, res) {

});
router.post('/depth-axis/new', function (req, res) {
    depthAxisModel.createNewDepthAxis(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});
router.delete('/depth-axis/delete', function (req, res) {
    depthAxisModel.deleteDepthAxis(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })

});

module.exports = router;