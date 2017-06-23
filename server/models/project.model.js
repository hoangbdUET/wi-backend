'use strict';
let project = require('./project/project.js');
let createDB = require('./test/test-create/createDB.js');
function createNewProject(projectInfo, cbCreateProject) {
    console.log("A new project is created");
    let conn = createDB.connect();
    createDB.create('mysqltest', conn, function (err, con) {
        if(err) {
            return console.log(err);
        }

    });
    project.insert(projectInfo, conn, function (err, status) {
        if (err) return cbCreateProject(err, status);
        cbCreateProject(false, status);
        conn.end();
    });

}

function editProject(projectInfo) {
    console.log("Project is editted");
}
function deleteProject(projectInfo) {
    console.log("Project is deleted")
}

module.exports.createNewProject = createNewProject;
module.exports.editProject = editProject;
module.exports.deleteProject = deleteProject;