'use strict';

let configcurve = require('./curve.config.js').curve;
let fs = require('fs');

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function insert(infoCurve, connect, callbackCurve) {
    let insertCurve = 'INSERT INTO curve (';
    let status;
    for (let i = 0; i < configcurve.field.length; i++) {
        insertCurve += configcurve.field[i];
        if (i != configcurve.field.length - 1) {
            insertCurve += ',';
        }
    }
    insertCurve += ') VALUES ("' + infoCurve.wellId + '", "' + infoCurve.name + '", "' + infoCurve.dataset + '", "' +
        infoCurve.family  + '", "' + infoCurve.unit + '", "' + infoCurve.ini_value +'");';
    console.log(insertCurve);
    connect.query(insertCurve, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };
            return callbackCurve(err, status);
        }
        let select = 'SELECT ID_PROJECT FROM curve WHERE NAME = ' + '"' + infoCurve.name + '";';
        console.log(select);
        connect.query(select, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                }
                return callbackCurve(err, status);
            }
            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id":json[0].ID_curve,
                "description":"Ma so cua project vua tao"
            }
            callbackCurve(err, status);
        });
    });

}


function delet(condition, connect) {
    let query = 'DELETE FROM curve WHERE ' + condition;
    connect.query(query, function (err, result) {
        if (err) throw err;
    });
}

function update(setup, condition, connect) {
    let query = 'UPDATE curve SET ' + setup + ' WHERE ' + condition;
    connect.query(query, function (err, result) {
        if (err) throw err;
    })
}

module.exports.readfile = readfile;
module.exports.insert = insert;
module.exports.delet = delet;
module.exports.update = update;


