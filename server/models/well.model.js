'use strict';

let well = require('./well/well.js');
let createDB = require('./test/test-create/createDB.js');

function createNewWell(wellInfo, cbCreateWell) {
    console.log("A new project is created");
    let conn = createDB.connect();
    createDB.create('mysqltest', conn, function (err, con) {
        if(err) {
            return console.log(err);
        }

    });
    well.insert(wellInfo, conn, function (err, status) {
        if (err) return cbCreateWell(err, status);
        cbCreateWell(false, status);
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
