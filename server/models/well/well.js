'use strict';

let configwell = require('./well.config.js').well;
let fs = require('fs');

function readfile(url) {
	let obj;
	obj = fs.readFileSync(url);
	return obj.toString();
}

function Length(url) {
	let obj = url;
	// let obj = JSON.parse((url));
	return obj.empty_2.length;
}

function insertDB(url,start,end,connect,callback) {
	let obj = url;
	let index;
	// obj = JSON.parse((url));
	let insert = 'INSERT INTO well (';
	for(let i = 0; i < configwell.field.length; i++) {
		insert += configwell.field[i];
		if(i != configwell.field.length - 1) {
			insert += ',';
		}
	}
	insert += ') VALUES ';
	let i;
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

				return callback(err, flag);
			}
			else {
				callback(false, flag);
			}
	});
}

function insert(connect,hangso,url, cb) {
	let length = Length(url);
	let status = {
		"id":123,
		"code":"000"
	}
	if(hangso > 10000) {
		console.log('Hang so qua lon');
	}
	else {
		if(length<hangso) {
			insertDB(url,0,length,connect, function(err, flag) {
				if(err) {
                    status = {
                        "id":123,
                        "code":"404"
                    }
                    cb(false, status);
					cb(err, flag);
					return ;
				}
				else {
					cb(false, status);
				}
			});
		}
		else {
			for(let j = 0; j < length/hangso; j++) {
				let start = j * hangso;
				let end = start + hangso;
                insertDB(url,start,end,connect, function(err, flag) {
                    if(err) {
                    	cb(err, flag);
                        return ;
                    }
                    else {
                        if (flag == false) {
                            status = {
                                "id":123,
                                "code":"404"
                            }
							cb(false, status);
                        }
                        else {
                            cb(false, status);
                        }
                    }
	            });
            }
		}
	}
}


function delet(condition, connect) {
	let query = 'DELETE FROM well WHERE ' + condition;
	connect.query(query, function(err, result) {
		if(err) throw err;
	});
}

function update(setup, condition, connect) {
	let query = 'UPDATE well SET ' + setup + ' WHERE ' + condition;
	connect.query(query, function(err, result) {
		if(err) throw err;
	})
}

module.exports.readfile = readfile;
module.exports.insertDB = insertDB;
module.exports.insert = insert;
module.exports.delet = delet;
module.exports.update = update;


