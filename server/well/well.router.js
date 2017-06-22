/**
 *
 * Created by minhtan on 20/06/2017.
 */
var express = require('express');
var router = express.Router();
var wellModel = require('../models/well.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/well', function (req, res) {
});
router.post('/well/new', function (req, res) {

    wellModel.createNewWell(req.body, function(err, status) {
     	res.send(status);
    }); // callback result
});
router.post('/well/edit', function (req, res) {
    const result=wellModel.createNewWell(req.body);
    res.send(result);
});
router.delete('/well/delete', function (req, res) {
    const result=wellModel.deleteWell(req.body);
    res.send(result);

});

module.exports = router;
