
var well = require('./well/well.js');
var createDB = require('./test/test-create/createDB.js');
	
function createNewWell(wellInfo, cbwell) {
	var url = './test/test-data/WELL.json'
	var hangso = 1000;
	var conn = createDB.connect();
	createDB.create('mysqltest', conn);
	well.create(conn,hangso,wellInfo,function(status) {
		cbwell(status);
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
