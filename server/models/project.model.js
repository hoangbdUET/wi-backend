
function createNewProject(projectInfo) {
    console.log("A new project is created");
    return {
        "id": "123"
    };

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