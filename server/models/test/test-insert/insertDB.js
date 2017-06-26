var fs = require('fs');
var createDB = require('../test-create/create-database.js');
var well = require('../../well/well.import.js');
var curve = require('../../curve/curve.import.js');
var property = require('../../property/property.js');
var well_curve_link = require('../../well-curve-link/well-curve-link.js');
var url = process.argv[2];
var hangso = 1000;

var conn = createDB.connectDatabase();
createDB.createDatabaseAndTable('mysqltest', conn, function (err,con) {
    if(err) {
        return console.log(err);
    }
    con.end();
});
well.insert(conn, hangso, url, function (err, result) {
    if(err) return console.log(err);
    return result;
});


