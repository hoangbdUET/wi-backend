'use strict';

let well = require('./well/well.js');
let createDB = require('./test/test-create/createDB.js');

function createNewWell(wellInfo, cbwell) {
    let hangso = 1000;
    let conn = createDB.connect();
    createDB.create('mysqltest', conn);
    well.insert(conn, hangso, wellInfo, function (err, status) {
        if (err) return cbwell(err, status);
        console.log('status', status);
        cbwell(false, status);
        conn.end();
    });


}
function editWell(wellInfo) {

}
function deleteWell(wellInfo) {

}

module.exports.createNewWell = createNewWell;
module.exports.editWell = editWell;
module.exports.deleteWell = deleteWell;
