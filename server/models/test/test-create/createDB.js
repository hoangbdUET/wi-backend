var mysql = require('mysql');
var config = require('./createDB.config.js').config;
//Connect DB
function connect() {
	var con = mysql.createConnection(config.connect);
	return con;
}

//Create Database and Table
function create(nameDB,con) {
	// con.connect(function(err) {
	// 	if(err) throw err;
	// });
	con.query('CREATE DATABASE IF NOT EXISTS ' + nameDB);
	usedb = 'USE ' + nameDB;
	con.query(usedb, function(err, result) {
		if(err) throw err;
	});
	var createtb = '';
	for(var i = 0; i < config.table.length; i++) {
		createtb = 'CREATE TABLE IF NOT EXISTS ';
		createtb += config.table[i].name + ' (';
		for(var j = 0; j < config.table[i].query.length; j++) {
			createtb += config.table[i].query[j];
			if(j != config.table[i].query.length - 1) {
				createtb += ',';
			}
		}
		createtb += ');';
		con.query(createtb,function(err,result) {
			if(err) throw err;
		});
	}
}

//export module
module.exports.connect = connect;
module.exports.create = create;
