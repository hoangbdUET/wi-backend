'use strict';
const express = require('express');
const config = require('config');
const fs = require('fs');
const cors = require('cors');
let palettify = require('wi-palettify');
const path = require('path');


let dataDir = path.join(__dirname, 'data');
let errorCodes = require('../../error-codes');
let ResponseJSON = require('../response');
let router = express.Router();
router.use(cors());

function encodePalFiles(callback) {
	//console.log("get files runner");
	palettify.extractRaw(dataDir, (err, ret) => {
		if (err) {
			callback(err, null);
		} else {
			callback(false, ret);
		}

	});
}

router.post('/all', function (req, res) {
//    console.log(dataDir);
	encodePalFiles(function (err, result) {
		if (err) {
			res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, "Failed", err));
		} else {
			req.dbConnection.ParameterSet.findAll({where: {type: "PALETTE"}}).then(pls => {
				pls.forEach(p => {
					result[p.name] = p.content;
				});
				res.send(ResponseJSON(errorCodes.CODES.SUCCESS, "Successful", result));
			});
		}
	});
});

module.exports = router;