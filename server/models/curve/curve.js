'use strict';

const fs = require('fs');

const CONFIG_CURVE = require('./curve.config.js').CONFIG_CURVE;

function insertCurve(inputCurve, connect, callbackCurve) {
    let insertCurve = 'INSERT INTO ' + CONFIG_CURVE.name + ' (';
    let status;

    for (let i = 0; i < CONFIG_CURVE.field.length; i++) {
        insertCurve += CONFIG_CURVE.field[i];
        if (i !== CONFIG_CURVE.field.length - 1) {
            insertCurve += ',';
        }
    }

    insertCurve += ') VALUES ("' +
        inputCurve.wellId + '", "' +
        inputCurve.name + '", "' +
        inputCurve.dataset + '", "' +
        inputCurve.family + '", "' +
        inputCurve.unit + '", "' +
        inputCurve.ini_value + '");';

    connect.query(insertCurve, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Have error about query insert"
            };

            return callbackCurve(err, status);
        }

        let select = 'SELECT ID_PROJECT FROM ' + CONFIG_CURVE.name + ' WHERE NAME = ' + '"' + inputCurve.name + '";';

        connect.query(select, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404,
                    "desc": "Have error about query select"
                };

                return callbackCurve(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[json.length - 1].ID_curve,
                "description": "Ma so cua curve vua tao"
            };

            return callbackCurve(err, status);
        });
    });
}

function updateCurve(inputCurve, connect, cbUpdateCurve) {
    let status;
    let query = 'UPDATE ' + CONFIG_CURVE.name + ' SET ' +
        'ID_WELL = ' + inputCurve.wellId + ', ' +
        'NAME = ' + '"' + inputCurve.name + '", ' +
        'DATA_SET = ' + inputCurve.data_set + '", ' +
        'FAMILY = ' + inputCurve.family + '", ' +
        'UNIT = ' + inputCurve.unit + '", ' +
        'INI_VALUE = ' + inputCurve.ini_value +
        ' WHERE ID_CURVE = ' + inputCurve.id_curve;

    connect.query(query, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not update. Have error..."
            };

            return cbUpdateCurve(err, status);
        }

        status = {
            "id": inputCurve.id_curve,
            "code": "000",
            "desc": "Updata data Success"
        };

        return cbUpdateCurve(false, status);
    })
}


function deleteCurve(inputCurve, connect, cbDeleteCurve) {
    let status;
    let query = 'DELETE FROM ' + CONFIG_CURVE.name + ' WHERE ID_CURVE' + inputCurve.id_curve;

    connect.query(query, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delele"
            };

            return cbDeleteCurve(err, status);
        }

        status = {
            "id": inputCurve.id_curve,
            "code": "000",
            "desc": "Delete data Success"
        };

        return cbDeleteCurve(err, status);
    });
}

module.exports = {
    insertCurve: insertCurve,
    deleteCurve: deleteCurve,
    updateCurve: updateCurve
};

