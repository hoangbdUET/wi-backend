// var models = require('../models');
// var Project = models.Project;
// var Well = models.Well;
var ErrorCodes = require('../../error-codes').CODES;
const ResponseJSON = require('../response');
var asyncLoop = require('async/each');
let asyncSeries = require('async/parallel');

function createNewProject(projectInfo, done, dbConnection) {
    var Project = dbConnection.Project;
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
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new project success", project));
        })
        .catch(function (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Project existed!"));
            } else {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            }
        });
};

function editProject(projectInfo, done, dbConnection) {
    var Project = dbConnection.Project;
    Project.findById(projectInfo.idProject)
        .then(function (project) {
            project.name = projectInfo.name;
            project.company = projectInfo.company;
            project.department = projectInfo.department;
            project.description = projectInfo.description;
            project.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Project success", projectInfo));
                })
                .catch(function (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Project existed!"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Project not found for edit"));
        })
}

function getProjectInfo(project, done, dbConnection) {
    var Project = dbConnection.Project;
    Project.findById(project.idProject)
        .then(function (project) {
            if (!project) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Project success", project));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Project not found for getInfo"));
        });
}

function getProjectList(owner, done, dbConnection) {
    var Project = dbConnection.Project;
    Project.all()
        .then(function (projects) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get List Project success", projects));
        }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "NO_DATABASE"));
    });
}

function deleteProject(projectInfo, done, dbConnection) {
    var Project = dbConnection.Project;
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
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Project not found for delete"));
        });
}

async function getProjectFullInfo(payload, done, dbConnection) {
    let project = await dbConnection.Project.findById(payload.idProject);
    let response = project.toJSON();
    let wells = await dbConnection.Well.findAll({where: {idProject: project.idProject}});
    let groups = await dbConnection.Groups.findAll({where: {idProject: project.idProject}});
    response.wells = [];
    response.groups = groups;
    if (wells.length == 0) {
        return done(ResponseJSON(ErrorCodes.SUCCESS, "Get full info Project success", response));
    }
    asyncLoop(wells, function (well, nextWell) {
        let wellObj = well.toJSON();
        asyncSeries([
            function (cb) {
                dbConnection.Dataset.findAll({where: {idWell: well.idWell}}).then(datasets => {
                    let datasetArr = [];
                    let datasetObj = {};
                    asyncLoop(datasets, function (dataset, nextDataset) {
                        datasetObj = dataset.toJSON();
                        dbConnection.Curve.findAll({
                            where: {idDataset: dataset.idDataset},
                            include: {
                                model: dbConnection.Family,
                                as: "LineProperty"
                            }
                        }).then(curves => {
                            datasetObj.curves = curves;
                            datasetArr.push(datasetObj);
                            nextDataset();
                        });
                    }, function () {
                        cb(null, datasetArr);
                    });
                });
            },
            function (cb) {
                dbConnection.ZoneSet.findAll({
                    where: {idWell: well.idWell},
                    include: {model: dbConnection.Zone}
                }).then(zonesets => {
                    cb(null, zonesets);
                });
            },
            function (cb) {
                dbConnection.Plot.findAll({where: {idWell: well.idWell}}).then(plots => {
                    cb(null, plots);
                });
            },
            function (cb) {
                dbConnection.Histogram.findAll({where: {idWell: well.idWell}}).then(histograms => {
                    cb(null, histograms);
                });
            },
            function (cb) {
                dbConnection.CrossPlot.findAll({where: {idWell: well.idWell}}).then(crossplots => {
                    cb(null, crossplots);
                });
            },
            function (cb) {
                dbConnection.CombinedBox.findAll({where: {idWell: well.idWell}}).then(combined_boxes => {
                    cb(null, combined_boxes);
                });
            }
        ], function (err, result) {
            wellObj.datasets = result[0];
            wellObj.zonesets = result[1];
            wellObj.plots = result[2];
            wellObj.histograms = result[3];
            wellObj.crossplots = result[4];
            wellObj.combined_boxes = result[5];
            response.wells.push(wellObj);
            nextWell();
        });
    }, function () {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Get full info Project success", response));
    });
}

function _getProjectFullInfo(project, done, dbConnection) {
    let idProject = project.idProject;
    let response = new Object();
    dbConnection.Project.findById(idProject, {
        include: [{
            model: dbConnection.Well,
            include: [{
                model: dbConnection.Dataset,
                include: [{
                    model: dbConnection.Curve,
                    include: [{
                        model: dbConnection.Family,
                        as: "LineProperty"
                    }]
                }]
            }, {
                model: dbConnection.Plot
            }, {
                model: dbConnection.CrossPlot
            }, {
                model: dbConnection.Histogram
            }, {
                model: dbConnection.CombinedBox
            }]
        }, {
            model: dbConnection.Groups
        }]
    }).then(project => {
        if (project) {
            response = project.toJSON();
            asyncLoop(response.wells, function (well, next) {
                dbConnection.ZoneSet.findAll({
                    where: {idWell: well.idWell},
                    include: {model: dbConnection.Zone}
                }).then(zs => {
                    zs = JSON.parse(JSON.stringify(zs));
                    response.wells[response.wells.indexOf(well)].zonesets = zs;
                    next();
                });
            }, function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Get full info Project success", response));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No project"));
        }
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
