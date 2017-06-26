'use strict';

let well = require('./well/well.js');
let createDatabase = require('./database/create-database.js');

function getWellInfo(inputWell, callbackWellInfo) {
    //Tuong tu voi getProjectInfo
}
function createNewWell(inputWell, callbackCreateWell) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, con) {
        if (err) return console.log(err);

        well.insertWell(inputWell, conn, function (err, status) {
            if (err) return callbackCreateWell(err, status);
            callbackCreateWell(false, status);
            conn.end();
        });
    });


}

function editWell(inputWell, callbackEditWell) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, con) {
        if (err) return console.log(err);

        well.updateWell(inputWell, conn, function (err, status) {
            if (err) return callbackEditWell(err, status);
            callbackEditWell(false, status);
            conn.end();
        });
    });
}

function deleteWell(inputWell, callbackDeleteWell) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, con) {
        if (err) return console.log(err);

        well.deleteWell(inputWell, conn, function (err, status) {
            if(err) return callbackDeleteWell(err, status);
            callbackDeleteWell(false, status);
            conn.end();
        });
    });
}

module.exports = {
    createNewWell: createNewWell,
    editWell: editWell,
    deleteWell: deleteWell,
    getWellInfo:getWellInfo
}

