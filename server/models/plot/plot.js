'use strict';

const CONFIG_PLOT = require('./plot.config.js').CONFIG_PLOT;
let fs = require('fs');

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function insertPlot(inputPlot, connect, callbackPlot) {
    let insertPlot = 'INSERT INTO plot (';
    let status;

    for (let i = 0; i < CONFIG_PROJECT.field.length; i++) {
        insertPlot += CONFIG_PROJECT.field[i];
        if (i !== CONFIG_PROJECT.field.length - 1) {
            insertPlot += ',';
        }
    }

    insertPlot += ') VALUES ("' +
        inputPlot.idWell + '", "' +
        inputPlot.name + '", "' +
        inputPlot.option + '");';
    connect.query(insertPlot, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };

            return callbackPlot(err, status);
        }

        let selectPlot = 'SELECT ID_PLOT FROM plot WHERE NAME = ' + '"' + inputPlot.name + '";';

        connect.query(selectPlot, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                };

                return callbackPlot(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[0].ID_PLOT,
                "description": "ID_PLOT is created before"
            };

            return callbackPlot(err, status);
        });
    });

}


function updatePlot(inputPlot, connect, callbackUpdatePlot) {
    let status;
    let updatePlot = 'UPDATE plot SET ' +
        'ID_WELL = ' + '"' + inputPlot.idWell + '", ' +
        'NAME = ' + inputPlot.name + '", ' +
        'OPTION = ' + inputPlot.option +
        ' WHERE ID_PLOT = ' + inputPlot.idPlot;

    connect.query(updatePlot, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not update. Have error..."
            };

            return callbackUpdatePlot(err, status);
        }

        status = {
            "id": inputPlot.idPlot,
            "code": "000",
            "desc": "Update data Success"
        };

        return callbackUpdatePlot(false, status);
    })
}

function deletePlot(inputPlot, connect, callbackDeletePlot) {
    let status;
    let deletePlot = 'DELETE FROM plot WHERE ID_PLOT' + inputPlot.idPlot;

    connect.query(deletePlot, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delele"
            };

            return callbackDeletePlot(err, status);
        }

        status = {
            "id": inputPlot.idPlot,
            "code": "000",
            "desc": "Delete data Success"
        };

        return callbackDeletePlot(err, status);
    });
}

module.exports = {
    readfile: readfile,
    insertPlot: insertPlot,
    deletePlot: deletePlot,
    updatePlot: updatePlot
};



