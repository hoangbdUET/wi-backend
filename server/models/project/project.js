'use strict';

let configproject = require('./project.config.js').project;
let fs = require('fs');

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function insert(infoProject, connect, callbackProject) {
    let insertProject = 'INSERT INTO project (';
    let status;
    for (let i = 0; i < configproject.field.length; i++) {
        insertProject += configproject.field[i];
        if (i != configproject.field.length - 1) {
            insertProject += ',';
        }
    }
    insertProject += ') VALUES ("' + infoProject.name + '", "' + infoProject.location + '", "' + infoProject.company + '", "' +
        infoProject.department  + '", "' + infoProject.description + '");';
    console.log(insertProject);
    connect.query(insertProject, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };
            return callbackProject(err, status);
        }
        let select = 'SELECT ID_PROJECT FROM project WHERE NAME = ' + '"' + infoProject.name + '";';
        console.log(select);
        connect.query(select, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                }
                return callbackProject(err, status);
            }
            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id":json[0].ID_PROJECT,
                "description":"Ma so cua project vua tao"
            }
            callbackProject(err, status);
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


