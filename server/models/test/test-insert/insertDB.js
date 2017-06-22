var fs = require('fs');
var createDB = require('../test-create/createDB.js');
var well = require('../../well/well.js');
var curve = require('../../curve/curve.js');
var property = require('../../property/property.js');
var well_curve_link = require('../../well-curve-link/well-curve-link.js');
var url = process.argv[2];
var hangso = 1000;

var conn = createDB.connect();
createDB.create('mysqltest', conn);
well.insert(conn,hangso,url);
conn.end();
