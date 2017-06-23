let mysql = require('mysql');
let config = require('./createDB.config.js').config;
//Connect DB
function connect() {
	let con = mysql.createConnection(config.connect);
	return con;
}

//Create Database and Table
function create(nameDB,con,callback) {
	// con.connect(function(err) {
	// 	if(err) throw err;
	// });
	con.query('CREATE DATABASE IF NOT EXISTS ' + nameDB);
	let usedb = 'USE ' + nameDB;
    let createtb = '';
	con.query(usedb, function(err, result) {
		if(err) {
			return console.log(err);
		}

	});
    for(let i = 0; i < config.table.length; i++) {
        createtb = 'CREATE TABLE IF NOT EXISTS ';
        createtb += config.table[i].name + ' (';
        for(let j = 0; j < config.table[i].query.length; j++) {
            createtb += config.table[i].query[j];
            if(j != config.table[i].query.length - 1) {
                createtb += ',';
            }
        }
        createtb += ');';
        console.log(createtb);
        con.query(createtb,function(err,result) {
            if(err) {
                return console.log(err);
            }

        });

    }
	callback(false, con);

}

//export module
module.exports.connect = connect;
module.exports.create = create;
