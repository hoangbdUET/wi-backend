let express = require('express');
let router = express.Router();
let ternaryModel = require('./ternary.model');

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
router.post('/ternary/list', function (req, res) {
    ternaryModel.listTernaryByCrossPlot(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/ternary/save-template', function (req, res) {
    ternaryModel.saveTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});
router.post('/ternary/list-template', function (req, res) {
    ternaryModel.exportTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});
router.post('/ternary/remove-template', function (req, res) {
    ternaryModel.removeTernary(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});
module.exports = router;