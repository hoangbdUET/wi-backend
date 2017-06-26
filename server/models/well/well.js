'use strict';

let fs = require('fs');

const CONFIG_WELL = require('./well.config.js').CONFIG_WELL;

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function selectWell(inputWell, connect, callbackSelectWell) {
    let selectWell = 'SELECT * FROM ' + CONFIG_WELL.name + ' WHERE ID_PROJECT = ' + inputWell.idProject + ';'; //condition select
    let status;

    connect.query(selectWell, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Select not found"
            };

            result = null;
            callbackSelectWell(err, status, result);
        }

        status = {
            "id": 1,
            "code": "000",
            "desc": "Select Successfull"
        };

        result = JSON.parse(JSON.stringify(result));
        callbackSelectWell(false, status, result);
    });
}

function insertWell(inputWell, connect, callbackWell) {
    let insertWell = 'INSERT INTO ' + CONFIG_WELL.name + ' (';
    let status;

    inputWell = JSON.parse(JSON.stringify(inputWell));
    for (let i = 0; i < CONFIG_WELL.field.length; i++) {
        insertWell += CONFIG_WELL.field[i];
        if (i !== CONFIG_WELL.field.length - 1) {
            insertWell += ',';
        }
    }

    insertWell += ') VALUES (' +
        inputWell.idProject + ', "' +
        inputWell.name + '", "' +
        inputWell.topDepth + '", "' +
        inputWell.bottomDepth + '", "' +
        inputWell.step + '");';

    connect.query(insertWell, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };

            return callbackWell(err, status);
        }

        let selectWell = 'SELECT ID_WELL FROM ' + CONFIG_WELL.name + ' WHERE NAME = ' + '"' + inputWell.name + '";';

        connect.query(selectWell, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                };

                return callbackWell(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[0].ID_WELL,
                "description": "Ma so cua project vua tao"
            };

            return callbackWell(err, status);
        });
    });

}

function updateWell(inputWell, connect, callbackUpdateWell) {
    inputWell = JSON.parse(JSON.stringify(inputWell));
    let status;
    let updateWell = 'UPDATE ' + CONFIG_WELL.name + ' SET ' +
        'ID_PROJECT = ' + '' + inputWell.idProject + ', ' +
        'NAME = "' + inputWell.name + '", ' +
        'TOP_DEPTH = "' + inputWell.topDepth + '", ' +
        'BOTTOM_DEPTH = "' + inputWell.bottomDepth + '", ' +
        'STEP = "' + inputWell.step + '" ' +
        'WHERE ID_WELL = ' + inputWell.idWell + ";";

    connect.query(updateWell, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not update. Have error..."
            };

            return callbackUpdateWell(err, status);
        }

        status = {
            "id": inputWell.idWell,
            "code": "000",
            "desc": "Update data Success"
        };

        return callbackUpdateWell(false, status);
    })
}

function deleteWell(inputWell, connect, callbackDeleteWell) {
    let status;
    let deleteWell = 'DELETE FROM ' + CONFIG_WELL.name + ' WHERE ID_WELL = ' + inputWell.idWell;

    connect.query(deleteWell, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delele"
            };
            console.log('desc about delete: ', deleteWell);
            console.log('err is : ', err);
            return callbackDeleteWell(err, status);
        }

        status = {
            "id": inputWell.idWell,
            "code": "000",
            "desc": "Delete data Success"
        };

        return callbackDeleteWell(err, status);
    });
}

module.exports = {
    readfile: readfile,
    selectWell: selectWell,
    insertWell: insertWell,
    deleteWell: deleteWell,
    updateWell: updateWell
};


