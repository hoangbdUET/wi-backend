var configlink = require('./well-curve-link.config.js').link;
var fs = require('fs');
var mysql = require('mysql');

function readfile(url) {
	var obj;
	obj = fs.readFileSync(url);
	return obj.toString();
}

function Length(url) {
	var obj = JSON.parse(readfile(url));
	return obj.empty_2.length;
}
function insertDB(url,start,end,connect) {
	var obj;
	var index;
	obj = JSON.parse(readfile(url));
	var insert = 'INSERT INTO link (';
	for(var i = 0; i < configlink.field.length; i++) {
		insert += configlink.field[i];
		if(i != configlink.field.length - 1) {
			insert += ',';
		}
	}
	insert += ') VALUES ';
	var i;
	i = start;
	for(i = start;i<end;i++) {
		insert += '('+obj.empty_2[i].idlink+','+obj.empty_2[i].idcurve +')';
		if(i!=end -1) {
			insert+=',';
		}
	}
	connect.query(insert,function(err,result){
			if(err) throw err;
	});
}


function insert(connect,hangso,url) {
	var length = Length(url);
	if(hangso > 10000) {
		console.log('Hang so qua lon');
	}
	else {
		if(length<hangso) {
			insertDB(url,0,length,connect);
		}
		else {
			for(var j = 0; j < length/hangso; j++) {
				let start = j * hangso;
				let end = start + hangso;
				insertDB(url, start, end, connect);
			}
		}
	}
}

function delet(condition, connect) {
	var query = 'DELETE FROM link WHERE ' + condition;
	connect.query(query, function(err, result) {
		if(err) throw err;
	});
}

function update(setup, condition, connect) {
	var query = 'UPDATE link SET ' + setup + ' WHERE ' + condition;
	connect.query(query, function(err, result) {
		if(err) throw err;
	})
}


module.exports.readfile = readfile;
module.exports.insertDB = insertDB;
module.exports.insert = insert;
module.exports.delet = delet;
module.exports.update = update;

