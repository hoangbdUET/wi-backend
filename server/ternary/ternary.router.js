var express = require('express');
var router = express.Router();
var ternaryModel = require('./ternary.model');
var bodyParser = require('body-parser');

router.post('/ternary/new', function (req, res) {
    ternaryModel.createNewTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);

});
router.post('/ternary/info', function (req, res) {
    ternaryModel.inforTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/ternary/edit', function (req, res) {
    ternaryModel.editTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.delete('/ternary/delete', function (req, res) {
    ternaryModel.deleteTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.delete('/ternary/list', function (req, res) {
    ternaryModel.listTernaryByCrossPlot(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
module.exports = router;