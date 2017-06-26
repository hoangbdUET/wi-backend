'use strict';

let plot = require('./plot/plot.js');
let createDatabase = require('./database/create-database.js');

function getPlot(inputPlot, callbackGetPlot) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);
        plot.selectPlot(inputPlot, conn, function (err, status, result) {
            if (err) return callbackGetPlot(err, status, result);
            callbackGetPlot(err, status, result);
            conn.end();
        });
    });
}

function createNewPlot(inputPlot, callbackCreatePlot) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);
        plot.insertPlot(inputPlot, conn, function (err, status) {
            if (err) return callbackCreatePlot(err, status);
            callbackCreatePlot(false, status);
            conn.end();
        });
    });
}

function editPlot(inputPlot, callbackEditPlot) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) console.log(err);
        plot.updatePlot(inputPlot, conn, function (err, status) {
            if (err) return callbackEditPlot(err, status);
            callbackEditPlot(false, status);
            conn.end();
        });
    });
}

function deletePlot(inputPlot, callbackDeletePlot) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) console.log(err);
        plot.deletePlot(inputPlot, conn, function (err, conn) {
            if (err) return callbackDeletePlot(err, status);
            callbackDeletePlot(false, status);
            conn.end();
        });
    });
}

module.exports = {
    getPlot: getPlot,
    createNewPlot: createNewPlot,
    editPlot: editPlot,
    deletePlot: deletePlot
};
