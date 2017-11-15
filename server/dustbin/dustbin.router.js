var express = require('express');
var router = express.Router();
var dustbinModel = require('./dustbin.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());


module.exports = router;