'use strict';

let track = require('./track/track.js');
let createDatabase = require('./database/create-database.js');

function createNewTrack(inputTrack, callbackCreateTrack) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);
        track.insertTrack(inputTrack, conn, function (err, status) {
            if (err) return callbackCreateTrack(err, status);
            callbackCreateTrack(false, status);
            conn.end();
        });
    });
}

function deleteTrack(inputTrack, callbackDeleteTrack) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);
        track.deleteTrack(inputTrack, conn, function (err, status) {
            if (err) return callbackDeleteTrack(err, status);
            callbackDeleteTrack(false, status);
            conn.end();
        })
    })
}

module.exports = {
    createTrack: createNewTrack,
    deleteTrack: deleteTrack
};

