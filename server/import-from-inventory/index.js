let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let model = require('./import.model');

router.use(bodyParser.json());

router.post('/inventory/import/curve', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    let curves = req.body;
    model.importCurves(curves, token, function (response) {
        res.send(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
    }, req.dbConnection, req.decoded.username, req.createdBy, req.updatedBy);
});

router.post('/inventory/import/dataset', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    let datasets = req.body;
    model.importDataset(datasets, token, function (response) {
        res.send(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
    }, req.dbConnection, req.decoded.username, req.createdBy, req.updatedBy);
});

module.exports = router;