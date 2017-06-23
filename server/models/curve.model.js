
'use strict';
let curve = require('./curve/curve.js');
let createDB = require('./test/test-create/createDB.js');
function createNewCurve(curveInfo, cbCreateCurve) {
    console.log("A new project is created");
    let conn = createDB.connect();
    createDB.create('mysqltest', conn, function (err, con) {
        if(err) {
            return console.log(err);
        }

    });
    curve.insert(curveInfo, conn, function (err, status) {
        if (err) return cbCreateCurve(err, status);
        cbCreateCurve(false, status);
        conn.end();
    });

}
function editCurve(curveInfo) {

}
function deleteCurve(curveInfo) {

}

module.exports.createNewCurve = createNewCurve;
module.exports.editCurve = editCurve;
module.exports.deleteCurve = deleteCurve;
