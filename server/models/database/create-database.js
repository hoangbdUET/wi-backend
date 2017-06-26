let mysql = require('mysql');
const CONFIG_DATABASE = require('./create-database.config.js').CONFIG_DATABASE;

function connectDatabase() {
    return mysql.createConnection(CONFIG_DATABASE.connect);
}

function createDatabaseAndTable(conn, callbackDatabaseAndTable) {
    let nameDatabase = CONFIG_DATABASE.database_name;
    conn.query('CREATE DATABASE IF NOT EXISTS ' + nameDatabase);
    let useDatabase = 'USE ' + nameDatabase;
    let createTable = '';

    conn.query(useDatabase, function (err, result) {
        if (err) {
            return console.log(err);
        }

        for (let i = 0; i < CONFIG_DATABASE.table.length; i++) {
            createTable = 'CREATE TABLE IF NOT EXISTS ';
            createTable += CONFIG_DATABASE.table[i].name + ' (';
            for (let j = 0; j < CONFIG_DATABASE.table[i].query.length; j++) {
                createTable += CONFIG_DATABASE.table[i].query[j];
                if (j !== CONFIG_DATABASE.table[i].query.length - 1) {
                    createTable += ',';
                }
            }
            createTable += ');';
            conn.query(createTable, function (err, result) {
                if (err) return callbackDatabaseAndTable(err, conn);
            });
        }

        return callbackDatabaseAndTable(false, conn);
    });


}

//export module
module.exports.connectDatabase = connectDatabase;
module.exports.createDatabaseAndTable = createDatabaseAndTable;
