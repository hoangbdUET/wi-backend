'use strict';

let fs = require('fs');

const CONFIG_TRACK = require('./track.config.js').CONFIG_TRACK;

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function insertTrack(inputTrack, connect, callbackTrack) {
    let insertTrack = 'INSERT INTO ' + CONFIG_TRACK.name + ' (';
    let status;

    for (let i = 0; i < CONFIG_TRACK.field.length; i++) {
        insertTrack += CONFIG_TRACK.field[i];
        if (i !== CONFIG_TRACK.field.length - 1) {
            insertTrack += ',';
        }
    }

    insertTrack += ') VALUES ("' +
        inputTrack.idPlot + '", "' +
        inputTrack.name + '", "' +
        inputTrack.option + '");';
    connect.query(insertTrack, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };

            return callbackTrack(err, status);
        }

        let selectTrack = 'SELECT ID_TRACK FROM ' + CONFIG_TRACK.name + ' WHERE NAME = ' + '"' + inputTrack.name + '";';

        connect.query(selectTrack, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                };

                return callbackTrack(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[json.length - 1].ID_Track,
                "description": "ID_Track is created before"
            };

            return callbackTrack(err, status);
        });
    });

}


function updateTrack(inputTrack, connect, callbackUpdateTrack) {
    let status;
    let updateTrack = 'UPDATE ' + CONFIG_TRACK.name + ' SET ' +
        'ID_PLOT = ' + '"' + inputTrack.idWell + '", ' +
        'NAME = ' + inputTrack.name + '", ' +
        'OPTION = ' + inputTrack.option +
        ' WHERE ID_TRACK = ' + inputTrack.idTrack;

    connect.query(updateTrack, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not update. Have error..."
            };

            return callbackUpdateTrack(err, status);
        }

        status = {
            "id": inputTrack.idTrack,
            "code": "000",
            "desc": "Update data Success"
        };

        return callbackUpdateTrack(false, status);
    })
}

function deleteTrack(inputTrack, connect, callbackDeleteTrack) {
    let status;
    let deleteTrack = 'DELETE FROM ' + CONFIG_TRACK.name + ' WHERE ID_TRACK' + inputTrack.idTrack;

    connect.query(deleteTrack, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delele"
            };

            return callbackDeleteTrack(err, status);
        }

        status = {
            "id": inputTrack.idTrack,
            "code": "000",
            "desc": "Delete data Success"
        };

        return callbackDeleteTrack(err, status);
    });
}

module.exports = {
    readfile: readfile,
    insertTrack: insertTrack,
    deleteTrack: deleteTrack,
    updateTrack: updateTrack
};



