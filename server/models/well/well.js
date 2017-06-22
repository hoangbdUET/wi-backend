var configwell = require('./well.config.js').well;
var fs = require('fs');
var mysql = require('mysql');

function readfile(url) {
	var obj;
	obj = fs.readFileSync(url);
	return obj.toString();
}

function Length(url) {
	var obj = url;
	// var obj = JSON.parse((url));
	return obj.empty_2.length;
}

function insertDB(url,start,end,connect,callback) {
	var obj = url;
	var index;
	// obj = JSON.parse((url));
	var insert = 'INSERT INTO well (';
	for(var i = 0; i < configwell.field.length; i++) {
		insert += configwell.field[i];
		if(i != configwell.field.length - 1) {
			insert += ',';
		}
	}
	insert += ') VALUES ';
	var i;
	let flag = true;
	i = start;
	for(i = start;i<end;i++) {
		insert += '('+obj.empty_2[i].STRT+'","'+obj.empty_2[i].STOP+ '","' + obj.empty_2[i].STEP+ '","'+ 
		obj.empty_2[i].SRVC1+ '", "'+ obj.empty_2[i].DATEE+'","'+obj.empty_2[i].WELL+ '","' + obj.empty_2[i].COMP+ '","'+ 
		obj.empty_2[i].FLD+'","'+obj.empty_2[i].LOC+ '","' + obj.empty_2[i].LATI+ '","'+ 
		obj.empty_2[i].LONGG+ '", "'+ obj.empty_2[i].RWS+ '", "'+ obj.empty_2[i].WST+ '","' + obj.empty_2[i].PROV+ '","'+
		obj.empty_2[i].SRVC2 +'")';
		if(i!=end -1) {
			insert+=',';
		}
	}
	connect.query(insert,function(err,result){
			if(err) {
				flag = false;
				callback(flag);
				return;
			}

	});
	callback(flag);
}


function insert(connect,hangso,url, cb) {
	var length = Length(url);
	var status = {
		"id":123,
		"code":"000"
	}
	if(hangso > 10000) {
		console.log('Hang so qua lon');
	}
	else {
		if(length<hangso) {
			insertDB(url,0,length,connect, function(flag) {
				if (flag == false) {
						status = {
						"id":123,
						"code":"404"
					}
					cb(status);
					return;
				}
									
			});
			cb(status);				

		}
		else {
			for(let j = 0; j < length/hangso; j++) {
				let start = j * hangso;
				let end = start + hangso;
				if(insertDB(url, start, end, connect) == true) {
					return true;
				};
			}
		}
	}
}

function create(connect, hangso, url) {
	insert(connect, hangso, url,function(status) {
		console.log('status',status);
		return status;
	})
}
function delet(condition, connect) {
	var query = 'DELETE FROM well WHERE ' + condition;
	connect.query(query, function(err, result) {
		if(err) throw err;
	});
}

function update(setup, condition, connect) {
	var query = 'UPDATE well SET ' + setup + ' WHERE ' + condition;
	connect.query(query, function(err, result) {
		if(err) throw err;
	})
}

module.exports.readfile = readfile;
module.exports.insertDB = insertDB;
module.exports.insert = insert;
module.exports.delet = delet;
module.exports.update = update;
module.exports.create = create;

