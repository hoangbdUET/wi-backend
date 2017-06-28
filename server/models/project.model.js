'use strict';
let project = require('./project/project.js');
let createDatabase = require('./database/create-database.js');

function getProjectInfo(inputProject,callbackProjectInfo) {
    //Ham nay tra ve thong tin cua 1 project dua vao ID cua no
    //Nhung thong tin nay bao gom ca danh sach cac Well
    //Moi Well gom 2 thong tin la ID va name cua well
    //inputProject la JSON { id: "123"}
    //Tra ve JSON. VD: { well:[ {id:"132", name"well1" },{ id:"133", name: "well2"}, { id: "134", name: "well3"})
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if(err) return console.log(err);

        project.selectProject(inputProject, conn, function (err, status) {
            if(err) return callbackProjectInfo(err, status);
            callbackProjectInfo(false, status);
            conn.end();
        });
    });
}


function createNewProject(inputProject, callbackCreateProject) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
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

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
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

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if (err) return console.log(err);

        project.deleteProject(inputProject, conn, function (err, status) {
            if(err) return callbackDeleteProject(err, status);
            callbackDeleteProject(false, status);
            conn.end();
        });
    });
}
function getProjectList(input,callbackProjectList) {
    let conn = createDatabase.connectDatabase();

    createDatabase.createDatabaseAndTable(conn, function (err, conn) {
        if(err) return console.log(err);

        project.listProject(input, conn, function (err, status) {
            if(err) return callbackProjectList(err, status);

            callbackProjectList(false, status);
            conn.end();
        });
    })
}

module.exports = {

    createNewProject: createNewProject,
    editProject: editProject,
    deleteProject: deleteProject,
    getProjectInfo: getProjectInfo,
    getProjectList:getProjectList
};
