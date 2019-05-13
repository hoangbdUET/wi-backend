const express = require('express');
const router = express.Router();
const wiXlsx = require('../utils/xlsx');
const path = require('path');
const async = require('async');
router.get('/utm-zones/', (req, res) => {
	let rows = wiXlsx.getRows(path.join(__dirname, 'UTM_Zones.xls'), 'Sheet1');
	let title = rows[0];
	rows = rows.slice(1);
	let rs = [];
	async.each(rows, (row, next) => {
		let obj = {};
		title.forEach((t, index) => {
			obj[t] = row[index]
		});
		rs.push(obj);
		next();
	}, () => {
		res.json(rs);
	});
});

router.post('/utm-zones/', (req, res) => {
	let rows = wiXlsx.getRows(path.join(__dirname, 'UTM_Zones.xls'), 'Sheet1');
	let title = rows[0];
	rows = rows.slice(1);
	let rs = [];
	async.each(rows, (row, next) => {
		let obj = {};
		title.forEach((t, index) => {
			obj[t] = row[index]
		});
		rs.push(obj);
		next();
	}, () => {
		res.json(rs);
	});
});
module.exports = router;