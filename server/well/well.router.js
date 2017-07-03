'use strict';

let express = require('express');
let router = express.Router();
let wellModel = require('./well.model');
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/well', function (req, res) {
    wellModel.getWellInfo(req.body, function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    });
});

router.post('/well/new', function (req, res) {
    wellModel.createNewWell(req.body, function(status) {
        res.send(status);
    }); // callback result
});

router.post('/well/edit', function (req, res) {
    wellModel.editWell(req.body, function (status) {
        res.send(status);
    });
});

router.delete('/well/delete', function (req, res) {
    // const result=wellModel.deleteWell(req.body);
    // res.send(result);

    wellModel.deleteWell(req.body, function (err, status) {
        if(err) return res.send(status);
        res.send(status);
    });
});

module.exports = router;
