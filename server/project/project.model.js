var models = require('../models');
var Project = models.Project;
var ErrorCodes = require('../../error-codes').CODES;

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
            //done({id:project.idProject,code:"00"});
            done({
                code: ErrorCodes.SUCCESS,
                reason: "Success",
                content: {
                    id:project.idProject
                }
            });
        })
        .catch(function (err) {
            // err.code = 203;
            done({code: ErrorCodes.ERROR_FIELD_EMPTY, reason: err.errors[0].message});
        });
};
function editProject(projectInfo, done) {
    Project.update({
        name: projectInfo.name,
        company: projectInfo.company,
        department: projectInfo.department,
        description: projectInfo.description
    },{
        where:{idProject:projectInfo.idProject}
    }).then(function () {
        done({
            code: ErrorCodes.SUCCESS,
            reason: "Success",
            content: {
                id: projectInfo.idProject
            }
        });
    })
    .catch(function (err) {
        done({id: projectInfo.idProject, status: err});
    });
}
function getProjectInfo(project,done) {
    Project.findById(project.idProject)
        .then(function (project) {
            done({
                code: ErrorCodes.SUCCESS,
                reason: 'Success',
                content: project
            });
        })
        .catch(function () {
            done({
                code: ErrorCodes.ERROR_ENTITY_NOT_EXITS,
                reason: "Not found"
            });

        });
}
function getProjectList(owner,done) {
    Project.all()
        .then(function (projects) {
            done({
                code: ErrorCodes.SUCCESS,
                reason: "Success",
                content: projects
            });
        });
}
function genLocationOfNewProject() {
    return "";
}
var projectEx = {
    idProject:1,
    name:"TAN",
    company:"tanlm",
    department:"khong biet",
    description:"ok"
};
// createNewProject(projectEx);
// editProject(projectEx);
module.exports = {
    createNewProject:createNewProject,
    editProject:editProject,
    getProjectInfo:getProjectInfo,
    getProjectList:getProjectList
};
