var models = require('../models');
var Project = models.Project;
var Well = models.Well;
var ErrorCodes = require('../../error-codes').CODES;
const ResponseJSON = require('../response');

function createNewProject(projectInfo, done) {
    Project.sync()
        .then(function () {
            return Project.create({
                name: projectInfo.name,
                location: genLocationOfNewProject(),
                company: projectInfo.company,
                department: projectInfo.department,
                description: projectInfo.description
            });
        })
        .then(function (project) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", {idProject: project.idProject}));
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_FIELD_EMPTY, err.name));
        });
};
function editProject(projectInfo, done) {
    Project.findById(projectInfo.idProject)
        .then(function (project) {
            project.name = projectInfo.name;
            project.company = projectInfo.company;
            project.department = projectInfo.department;
            project.description = projectInfo.description;
            project.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Success", projectInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Project not exist"));
        })
}
function getProjectInfo(project, done) {
    Project.findById(project.idProject, {include: [Well]})
        .then(function (project) {
            if (!project) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", project));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}
function getProjectList(owner, done) {
    Project.all()
        .then(function (projects) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", projects));
        });
}
function deleteProject(projectInfo, done) {
    Project.findById(projectInfo.idProject)
        .then(function (project) {
            project.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Deleted", project));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.errors[0].message));
                })

        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}
function getProjectFullInfo(project, done) {
    Project.findById(project.idProject, {
        include: [{all:true,include:[{all:true,include:{all:true}}]}]
    })
        .then(function (project) {
            if (!project) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", project));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}
function genLocationOfNewProject() {
    return "";
}

module.exports = {
    createNewProject: createNewProject,
    editProject: editProject,
    getProjectInfo: getProjectInfo,
    getProjectList: getProjectList,
    deleteProject: deleteProject,
    getProjectFullInfo: getProjectFullInfo
};
