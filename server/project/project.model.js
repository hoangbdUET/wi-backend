let ErrorCodes = require('../../error-codes').CODES;
const ResponseJSON = require('../response');
let asyncLoop = require('async/each');
let asyncSeries = require('async/parallel');
let request = require('request');
let config = require('config');
let models = require('../models');
let openProject = require('../authenticate/opening-project');

function createNewProject(projectInfo, done, dbConnection) {
    let Project = dbConnection.Project;
    Project.sync()
        .then(function () {
            return Project.create(projectInfo);
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
    delete projectInfo.createdBy;
    let Project = dbConnection.Project;
    Project.findById(projectInfo.idProject)
        .then(function (project) {
            project.name = projectInfo.name;
            project.company = projectInfo.company;
            project.department = projectInfo.department;
            project.description = projectInfo.description;
            project.updatedBy = projectInfo.updatedBy;
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
    let Project = dbConnection.Project;
    Project.findById(project.idProject)
        .then(function (project) {
            if (!project) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Project success", project));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Project not found for getInfo"));
        });
}

function getSharedProject(token, username) {
    return new Promise(function (resolve, reject) {
        let options = {
            method: 'POST',
            url: 'http://' + config.Service.authenticate + '/shared-project/list',
            headers: {
                'Cache-Control': 'no-cache',
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: {username: username},
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
                resolve([]);
            } else {
                resolve(body.content);
            }
        });
    });
}

async function getProjectList(owner, done, dbConnection, username, realUser, token) {
    dbConnection = models('wi_' + realUser);
    let response = [];
    let projectList = await getSharedProject(token, realUser);
    let Project = dbConnection.Project;
    Project.all().then(function (projects) {
        asyncLoop(projects, function (project, next) {
            project = project.toJSON();
            project.displayName = project.name;
            response.push(project);
            next();
        }, function () {
            if (projectList.length > 0) {
                asyncLoop(projectList, function (prj, next) {
                    let shareDbConnection = models('wi_' + prj.owner);
                    shareDbConnection.Project.findOne({where: {name: prj.name}}).then(p => {
                        if (!p) {
                            next();
                        } else {
                            p = p.toJSON();
                            p.displayName = p.name + '   || ' + prj.owner + ' || ' + prj.group;
                            p.shared = true;
                            p.owner = prj.owner;
                            response.push(p);
                            next();
                        }
                    });
                }, function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Get List Project success", response));
                });
            } else {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Get List Project success", response));
            }
        });

    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "NO_DATABASE"));
    });
}

function deleteProject(projectInfo, done, dbConnection) {
    let Project = dbConnection.Project;
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

async function getProjectFullInfo(payload, done, req) {
    if (payload.shared && payload.shared.toString() === 'true') {
        await openProject.addRow({username: req.decoded.realUser, project: payload.name, owner: payload.owner});
        req.dbConnection = models('wi_' + payload.owner.toLowerCase());
    } else {
        await openProject.removeRow({username: req.decoded.realUser});
        req.dbConnection = models(('wi_' + req.decoded.realUser));
    }
    let dbConnection = req.dbConnection;
    let project = await dbConnection.Project.findById(payload.idProject);
    if (!project) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Project not found"));
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
                    asyncLoop(datasets, function (dataset, nextDataset) {
                        let datasetObj = dataset.toJSON();
                        dbConnection.Curve.findAll({
                            where: {idDataset: dataset.idDataset},
                            include: {
                                model: dbConnection.Family,
                                as: "LineProperty",
                                include: {
                                    model: dbConnection.FamilySpec,
                                    as: "family_spec",
                                    where: {
                                        isDefault: true
                                    }
                                }
                            }
                        }).then(curves => {
                            let curveArr = [];
                            asyncLoop(curves, function (curve, nextCurve) {
                                let curveObj = curve.toJSON();
                                if (curveObj.LineProperty) {
                                    curveObj.LineProperty.blockPosition = curveObj.LineProperty.family_spec[0].blockPosition;
                                    curveObj.LineProperty.displayMode = curveObj.LineProperty.family_spec[0].displayMode;
                                    curveObj.LineProperty.displayType = curveObj.LineProperty.family_spec[0].displayType;
                                    curveObj.LineProperty.lineColor = curveObj.LineProperty.family_spec[0].lineColor;
                                    curveObj.LineProperty.lineStyle = curveObj.LineProperty.family_spec[0].lineStyle;
                                    curveObj.LineProperty.lineWidth = curveObj.LineProperty.family_spec[0].lineWidth;
                                    curveObj.LineProperty.maxScale = curveObj.LineProperty.family_spec[0].maxScale;
                                    curveObj.LineProperty.minScale = curveObj.LineProperty.family_spec[0].minScale;
                                    curveObj.LineProperty.unit = curveObj.LineProperty.family_spec[0].unit;
                                    delete curveObj.LineProperty.family_spec;
                                }
                                curveArr.push(curveObj);
                                nextCurve();
                            }, function () {
                                datasetObj.curves = curveArr;
                                datasetArr.push(datasetObj);
                                nextDataset();
                            });
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
            },
            function (cb) {
                dbConnection.WellHeader.findAll({where: {idWell: well.idWell}}).then(headers => {
                    cb(null, headers);
                });
            }
        ], function (err, result) {
            wellObj.datasets = result[0];
            wellObj.zonesets = result[1];
            wellObj.plots = result[2];
            wellObj.histograms = result[3];
            wellObj.crossplots = result[4];
            wellObj.combined_boxes = result[5];
            wellObj.wellheaders = result[6];
            response.wells.push(wellObj);
            nextWell();
        });
    }, function () {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Get full info Project success", response));
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
