'use strict';

let fs = require('fs');

const CONFIG_DEPTH_AXIS = require('./depth-axis.config.js').CONFIG_DEPTH_AXIS;

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function insertDepthAxis(inputDepthAxis, connect, callbackDepthAxis) {
    let insertDepthAxis = 'INSERT INTO ' + CONFIG_DEPTH_AXIS.name + ' (';
    let status;

    for (let i = 0; i < CONFIG_DEPTH_AXIS.field.length; i++) {
        insertDepthAxis += CONFIG_DEPTH_AXIS.field[i];
        if (i !== CONFIG_DEPTH_AXIS.field.length - 1) {
            insertDepthAxis += ',';
        }
    }

    insertDepthAxis += ') VALUES ("' +
        inputDepthAxis.idPlot + '", "' +
        inputDepthAxis.name + '", "' +
        inputDepthAxis.option + '");';
    connect.query(insertDepthAxis, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };

            return callbackDepthAxis(err, status);
        }

        let selectDepthAxis = 'SELECT ID_DEPTH_AXIS FROM ' + CONFIG_DEPTH_AXIS.name + ' WHERE NAME = ' + '"' + inputDepthAxis.name + '";';

        connect.query(selectDepthAxis, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                };

                return callbackDepthAxis(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[0].ID_DepthAxis,
                "description": "ID_DepthAxis is created before"
            };

            return callbackDepthAxis(err, status);
        });
    });

}


function updateDepthAxis(inputDepthAxis, connect, callbackUpdateDepthAxis) {
    let status;
    let updateDepthAxis = 'UPDATE ' + CONFIG_DEPTH_AXIS.name + ' SET ' +
        'ID_PLOT = ' + '"' + inputDepthAxis.idWell + '", ' +
        'NAME = ' + inputDepthAxis.name + '", ' +
        'OPTION = ' + inputDepthAxis.option +
        ' WHERE ID_DEPTH_AXIS = ' + inputDepthAxis.idDepthAxis;

    connect.query(updateDepthAxis, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not update. Have error..."
            };

            return callbackUpdateDepthAxis(err, status);
        }

        status = {
            "id": inputDepthAxis.idDepthAxis,
            "code": "000",
            "desc": "Update data Success"
        };

        return callbackUpdateDepthAxis(false, status);
    })
}

function deleteDepthAxis(inputDepthAxis, connect, callbackDeleteDepthAxis) {
    let status;
    let deleteDepthAxis = 'DELETE FROM ' + CONFIG_DEPTH_AXIS.name + ' WHERE ID_DEPTH_AXIS' + inputDepthAxis.idDepthAxis;

    connect.query(deleteDepthAxis, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delele"
            };

            return callbackDeleteDepthAxis(err, status);
        }

        status = {
            "id": inputDepthAxis.idDepthAxis,
            "code": "000",
            "desc": "Delete data Success"
        };

        return callbackDeleteDepthAxis(err, status);
    });
}

module.exports = {
    readfile: readfile,
    insertDepthAxis: insertDepthAxis,
    deleteDepthAxis: deleteDepthAxis,
    updateDepthAxis: updateDepthAxis
};



