'use strict';
let project = require('./project/project.js');
let createDB = require('./test/test-create/createDB.js');
function createNewProject(projectInfo, cbproject) {
    console.log("A new project is created");
    let hangso = 1000;
    let conn = createDB.connect();
    createDB.create('mysqltest', conn, function (err, con) {
        if(err) {
            return console.log(err);
        }

    });
    project.insert(projectInfo, conn, function (err, status) {
        if (err) return cbproject(err, status);
        cbproject(false, status);
        conn.end();
    });

}

let info = {
    "name":"abcxyz",
    "location": "/df/fdfd",
    "company":"dai hoc cong nghe",
    "department":"khoa cntt",
    "description":"thuoc dai hoc quoc gia"
};
createNewProject(info, function (err,status) {
    if(err) {
        return console.log('err la: ' + err+ '   ~~~   status la ' + status);
    }
    console.log('stattus la ',status);
})
function editProject(projectInfo) {
    console.log("Project is editted");
}
function deleteProject(projectInfo) {
    console.log("Project is deleted")
}

module.exports.createNewProject = createNewProject;
module.exports.editProject = editProject;
module.exports.deleteProject = deleteProject;