'use strict';

let curve = require('./curve/curve.js');
let createDatabase = require('./database/create-database.js');

function createNewCurve(inputCurve, callbackCreateCurve) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);

        curve.insertCurve(inputCurve, conn, function (err, status) {
            if (err) return callbackCreateCurve(err, status);
            callbackCreateCurve(false, status);
            conn.end();
        });
    });
}

function editCurve(inputCurve, callbackEditCurve) {
    let conn = createDatabase.connectDatabase();
    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if(err) return console.log(err);

        curve.updateCurve(inputCurve, conn, function (err, status) {
            if (err) return callbackEditCurve(err, status);
            callbackEditCurve(false, status);
            conn.end();
        });
    });

}

function deleteCurve(inputCurve, callbackDeleteCurve) {
    let conn = createDatabase.connectDatabase();

    curve.deleteCurve(inputCurve, conn, function (err, status) {
        if(err) return callbackDeleteCurve(err, status);
        callbackDeleteCurve(false, status);
        conn.end();
    });
}

module.exports = {
    createNewCurve: createNewCurve,
    editCurve: editCurve,
    deleteCurve: deleteCurve
};
