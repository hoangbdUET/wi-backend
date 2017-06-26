'use strict';

let depthAxis = require('./depth-axis/depth-axis.js');
let createDatabase = require('./database/create-database.js');

function createNewDepthAxis(inputDepthAxis, callbackCreateDepthAxis) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (conn) return console.log(err);
        depthAxis.insertDepthAxis(inputDepthAxis, conn, function (err, status) {
            if (err) return callbackCreateDepthAxis(err, status);
            callbackCreateDepthAxis(false, status);
            conn.end();
        })
    });
}

function deleteDepthAxis(inputDepthAxis, callbackDeleteDepthAxis) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);
        depthAxis.deleteDepthAxis(inputDepthAxis, conn, function (err, status) {
            if (err) return callbackDeleteDepthAxis(err, status);
            callbackDeleteDepthAxis(false, status);
            conn.end();
        })
    });
}

module.exports = {
    createNewDepthAxis: createNewDepthAxis,
    deleteDepthAxis: deleteDepthAxis
};

