'use strict';

let configwell = require('./well.config.js').well;
let fs = require('fs');

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function insert(infoWell, connect, callbackWell) {
    infoWell = JSON.parse(JSON.stringify(infoWell));
    let insertWell = 'INSERT INTO well (';
    let status;
    for (let i = 0; i < configwell.field.length; i++) {
        insertWell += configwell.field[i];
        if (i != configwell.field.length - 1) {
            insertWell += ',';
        }
    }
    insertWell += ') VALUES (' + infoWell.projectId + ', "' + infoWell.name + '", "' + infoWell.top_depth + '", "' +
        infoWell.bottom_depth  + '", "' + infoWell.step + '");';
    console.log(insertWell);
    connect.query(insertWell, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };
            return callbackWell(err, status);
        }
        let select = 'SELECT ID_WELL FROM well WHERE NAME = ' + '"' + infoWell.name + '";';
        console.log(select);
        connect.query(select, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                }
                return callbackWell(err, status);
            }
            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id":json[0].ID_WELL,
                "description":"Ma so cua project vua tao"
            }
            callbackWell(err, status);
        });
    });

}


function delet(condition, connect) {
    let query = 'DELETE FROM well WHERE ' + condition;
    connect.query(query, function (err, result) {
        if (err) throw err;
    });
}

function update(setup, condition, connect) {
    let query = 'UPDATE well SET ' + setup + ' WHERE ' + condition;
    connect.query(query, function (err, result) {
        if (err) throw err;
    })
}

module.exports.readfile = readfile;
module.exports.insert = insert;
module.exports.delet = delet;
module.exports.update = update;


