'use strict';

const CONFIG_PLOT = require('./plot.config.js').CONFIG_PLOT;
let fs = require('fs');

function selectPlot(inputPlot, connect, callbackSelectPlot) {
    let selectPlot = 'SELECT * FROM ' + CONFIG_PLOT.name + ' WHERE ID_WELL = ' + inputPlot.idWell + ';'; //condition select
    let status;

    connect.query(selectPlot, function (err, result) {
        if(err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Select not found"
            };

            result = null;
            callbackSelectPlot(err, status);
        }
        result = JSON.parse(JSON.stringify(result));
        status = {
            "id": 1,
            "code": "000",
            "desc": "Select Successfull",
            "Plots": result
        };


        callbackSelectPlot(false, status);
    });
}

function insertPlot(inputPlot, connect, callbackInsertPlot) {
    let insertPlot = 'INSERT INTO ' + CONFIG_PLOT.name+ '(';
    let status;

    for (let i = 0; i < CONFIG_PLOT.field.length; i++) {
        insertPlot += CONFIG_PLOT.field[i];
        if (i !== CONFIG_PLOT.field.length - 1) {
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

            return callbackInsertPlot(err, status);
        }

        let selectPlot = 'SELECT ID_PLOT FROM ' + CONFIG_PLOT.name + ' WHERE NAME = ' + '"' + inputPlot.name + '";';

        connect.query(selectPlot, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                };

                return callbackInsertPlot(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[json.length - 1].ID_PLOT,
                "description": "ID_PLOT is created before"
            };

            return callbackInsertPlot(err, status);
        });
    });

}


function updatePlot(inputPlot, connect, callbackUpdatePlot) {
    let status;
    let updatePlot = 'UPDATE ' + CONFIG_PLOT.name + ' SET ' +
        'ID_WELL = ' + '"' + inputPlot.idWell + '", ' +
        'NAME = "' + inputPlot.name + '", ' +
        'OPTION = "' + inputPlot.option + '"' +
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
    let deletePlot = 'DELETE FROM ' +  CONFIG_PLOT.name +' WHERE ID_PLOT = ' + inputPlot.idPlot;

    connect.query(deletePlot, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delete"
            };

            return callbackDeletePlot(err, status);
        }

        status = {
            "id": inputPlot.idPlot,
            "code": "000",
            "desc": "Delete data Success"
        };

        return callbackDeletePlot(false, status);
    });
}

module.exports = {
    selectPlot: selectPlot,
    insertPlot: insertPlot,
    deletePlot: deletePlot,
    updatePlot: updatePlot
};



