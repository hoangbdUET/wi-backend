'use strict';

const CONFIG_PROJECT = require('./project.config.js').CONFIG_PROJECT;
let fs = require('fs');

function readfile(url) {
    let obj;
    obj = fs.readFileSync(url);
    return obj.toString();
}

function selectProject(connect, callbackSelectProject) {
    let selectProject = 'SELECT * FROM ' + CONFIG_PROJECT.name + ' WHERE ID_PROJECT = 1'; //condition select
    let status;

    connect.query(selectProject, function (err, result) {
        if(err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Select not found"
            };

            result = null;
            callbackSelectProject(err, status, result);
        }

        status = {
            "id": 1,
            "code": "000",
            "desc": "Select Successfull"
        };

        result = JSON.parse(JSON.stringify(result));
        callbackSelectProject(false, status, result);
    });
}

function insertProject(inputProject, connect, callbackProject) {
    let insertProject = 'INSERT INTO project (';
    let status;

    for (let i = 0; i < CONFIG_PROJECT.field.length; i++) {
        insertProject += CONFIG_PROJECT.field[i];
        if (i !== CONFIG_PROJECT.field.length - 1) {
            insertProject += ',';
        }
    }

    insertProject += ') VALUES ("' +
        inputProject.name + '", "' +
        inputProject.location + '", "' +
        inputProject.company + '", "' +
        inputProject.department + '", "' +
        inputProject.description + '");';
    connect.query(insertProject, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404
            };

            return callbackProject(err, status);
        }

        let selectProject = 'SELECT ID_PROJECT FROM project WHERE NAME = ' + '"' + inputProject.name + '";';

        connect.query(selectProject, function (err, result) {
            if (err) {
                status = {
                    "id": -1,
                    "code": 404
                };

                return callbackProject(err, status);
            }

            let json = JSON.parse(JSON.stringify(result));
            status = {
                "id": json[0].ID_PROJECT,
                "description": "ID_PROJECT is created before"
            };

            return callbackProject(err, status);
        });
    });

}


function updateProject(inputProject, connect, callbackUpdateProject) {
    let status;
    let updateProject = 'UPDATE project SET ' +
        'NAME = ' + '"' + inputProject.name + '", ' +
        'LOCATION = ' + inputProject.location + '", ' +
        'COMPANY = ' + inputProject.company + '", ' +
        'DEPARTMENT = ' + inputProject.department + '", ' +
        'DESCRIPTION = ' + inputProject.description +
        ' WHERE ID_PROJECT = ' + inputProject.idProject;

    connect.query(updateProject, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not update. Have error..."
            };

            return callbackUpdateProject(err, status);
        }

        status = {
            "id": inputProject.idProject,
            "code": "000",
            "desc": "Update data Success"
        };

        return callbackUpdateProject(false, status);
    })
}

function deleteProject(inputProject, connect, callbackDeleteProject) {
    let status;
    let deleteProject = 'DELETE FROM project WHERE ID_PROJECT' + inputProject.idProject;

    connect.query(deleteProject, function (err, result) {
        if (err) {
            status = {
                "id": -1,
                "code": 404,
                "desc": "Data not Delete. Have error about query delele"
            };

            return callbackDeleteProject(err, status);
        }

        status = {
            "id": inputProject.idProject,
            "code": "000",
            "desc": "Delete data Success"
        };

        return callbackDeleteProject(err, status);
    });
}

module.exports = {
    readfile: readfile,
    selectProject: selectProject,
    insertProject: insertProject,
    deleteProject: deleteProject,
    updateProject: updateProject
};



