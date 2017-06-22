
var well = require('../well/well.js');
var fs = require('fs');
var createDB = require('../test-create/createDB.js');
var well = require('../../well/well.js');
var curve = require('../../curve/curve.js');
var property = require('../../property/property.js');
var well_curve_link = require('../../well-curve-link/well-curve-link.js');

function createNewWell(wellInfo) {
	var url = process.argv[2];
	var hangso = 1000;
	var conn = createDB.connect();
	createDB.create('mysqltest', conn);
	var status = {
		"id":123,
		"code":00
	}
	well.insert(conn,hangso,url, function(flag) {
	// body...
	if(flag == true) {
		return status;
	}
	else {
		console.log('err');
	}
	});
conn.end();

}
function editWell(wellInfo) {

}
function deleteWell(wellInfo) {

}

module.exports.createNewWell = createNewWell;
module.exports.editWell = editWell;
module.exports.deleteWell = deleteWell;
