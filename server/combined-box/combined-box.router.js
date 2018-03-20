let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
router.use(bodyParser.json());

let Model = require('./combined-box.model');
router.post('/combined-box/new', function (req, res) {
    Model.createNewCombinedBox(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/combined-box/info', function (req, res) {
    Model.infoCombinedBox(req.body, function (status) {
        res.send(status);
    }, req.dbConnection, req.decoded.username);
});

router.post('/combined-box/edit', function (req, res) {
    Model.editCombinedBox(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/combined-box/delete', function (req, res) {
    Model.deleteCombinedBox(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;