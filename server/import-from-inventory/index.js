let config = require('config');
let express = require("express");
let router = express.Router();
let curveModels = require('../curve/curve.model');
let bodyParser = require("body-parser");
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let fs = require('fs-extra');
let asyncEach = require('async/each');

router.use(bodyParser.json());
router.get('/inventory/', function (req, res) {
    res.send(ResponseJSON(ErrorCodes.SUCCESS, "Hello", "Hello"));
});

router.post('/inventory/import/curve', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    let curves = req.body;
    let response = [];
    asyncEach(curves, function (curve, next) {
        setTimeout(function () {
            curveModels.getCurveDataFromInventory(curve, token, function (err, result) {
                if (err) {
                    response.push(err);
                } else {
                    response.push(result);
                }
                next();
            }, req.dbConnection, req.decoded.username);
        }, 100);
    }, function () {
        res.send(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
    });
});

router.post('/inventory/import/dataset', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    let datasets = req.body;
    let response = [];
    asyncEach(datasets, function (dataset, next) {
        let newDataset = {};
        newDataset.name = dataset.name;
        newDataset.datasetKey = dataset.name;
        newDataset.datasetLabel = dataset.name;
        newDataset.idWell = dataset.idDesWell;
        req.dbConnection.Dataset.findOrCreate({
            where: {name: newDataset.name, idWell: newDataset.idWell},
            defaults: {
                name: newDataset.name,
                idWell: newDataset.idWell,
                datasetKey: newDataset.datasetKey,
                datasetLabel: newDataset.datasetLabel
            }
        }).then(rs => {
            let _dataset = rs[0];
            asyncEach(dataset.curves, function (curve, nextCurve) {
                setTimeout(function () {
                    curve.idDesDataset = _dataset.idDataset;
                    curveModels.getCurveDataFromInventory(curve, token, function (err, result) {
                        if (err) {
                            response.push(err);
                            nextCurve();
                        } else {
                            response.push(result);
                            nextCurve();
                        }
                    }, req.dbConnection, req.decoded.username);
                }, 100);
            }, function () {
                next();
            });
        }).catch(err => {
            console.log(err);
            response.push(err);
            next();
        });
    }, function () {
        res.send(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
    });
});

module.exports = router;