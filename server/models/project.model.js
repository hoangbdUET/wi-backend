'use strict';
let project = require('./project/project.js');
let createDatabase = require('./database/create-database.js');

function createNewProject(inputProject, callbackCreateProject) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, con) {
        if (err) return console.log(err);

        project.insertProject(inputProject, conn, function (err, status) {
            if (err) return callbackCreateProject(err, status);
            callbackCreateProject(false, status);
            conn.end();
        });
    });
}

function editProject(inputProject, callbackEditProject) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, con) {
        if (err) return console.log(err);

        project.updateProject(inputProject, conn, function (err, status) {
            if (err) return callbackEditProject(err, status);
            callbackEditProject(false, status);
            conn.end();
        });
    });
}

function deleteProject(inputProject, callbackDeleteProject) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, con) {
        if (err) return console.log(err);

        project.deleteProject(inputProject, conn, function (err, status) {
            if(err) return callbackDeleteProject(err, status);
            callbackDeleteProject(false, status);
            conn.end();
        });
    });
}

module.exports = {
    createNewProject: createNewProject,
    editProject: editProject,
    deleteProject: deleteProject
}
