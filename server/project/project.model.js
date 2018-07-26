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

async function getDatabases() {
    const modelMaster = require('../models-master');
    const sequelize = require('sequelize');
    let result = [];
    let dbs = await modelMaster.sequelize.query("SHOW DATABASES LIKE '" + config.Database.prefix + "%'", {type: sequelize.QueryTypes.SELECT});
    dbs.forEach(db => {
        result.push(db[Object.keys(db)]);
    });
    return result;
}

async function getProjectList(owner, done, dbConnection, username, realUser, token) {
    let databasesList = await getDatabases();
    dbConnection = models(config.Database.prefix + realUser);
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
                    let dbName = config.Database.prefix + prj.owner;
                    if (databasesList.indexOf(dbName) !== -1) {
                        let shareDbConnection = models(dbName);
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
                    } else {
                        next();
                    }
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
    const sequelize = require('sequelize');
    let dbName = config.Database.prefix + projectInfo.createdBy;
    let query = "DELETE FROM " + dbName + ".project WHERE idProject = " + projectInfo.idProject;
    dbConnection.query(query, {type: sequelize.QueryTypes.UPDATE}).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
    });
}

function updatePermission(req, done) {
    let userPermission = require('../utils/permission/user-permission');
    userPermission.loadUserPermission(req.token, req.body.project_name, req.body.username).then(() => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful " + req.body.username));
    });
}

async function getProjectFullInfo(payload, done, req) {
    let userPermission = require('../utils/permission/user-permission');
    if (payload.shared && payload.shared.toString() === 'true') {
        // console.log("LOAD SHARED PROJECT");
        await userPermission.loadUserPermission(req.token, payload.name, req.decoded.realUser);
        await openProject.removeRow({username: req.decoded.realUser});
        await openProject.addRow({username: req.decoded.realUser, project: payload.name, owner: payload.owner});
        req.dbConnection = models(config.Database.prefix + payload.owner.toLowerCase());
    } else {
        // console.log("LOAD USER PROJECT");
        await userPermission.loadUserPermission(req.token, payload.name, req.decoded.realUser, true);
        await openProject.removeRow({username: req.decoded.realUser});
        req.dbConnection = models((config.Database.prefix + req.decoded.realUser));
    }
    let dbConnection = req.dbConnection;
    let project = await dbConnection.Project.findById(payload.idProject);
    if (!project) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Project not found"));

    let response = project.toJSON();
    response.owner = payload.owner ? payload.owner : null;
    response.shared = payload.shared ? payload.shared : null;
    let wells = await dbConnection.Well.findAll({where: {idProject: project.idProject}});
    let groups = await dbConnection.Groups.findAll({where: {idProject: project.idProject}});
    let plots = await dbConnection.Plot.findAll({where: {idProject: project.idProject}});
    let crossplots = await dbConnection.CrossPlot.findAll({where: {idProject: project.idProject}});
    let histograms = await dbConnection.Histogram.findAll({where: {idProject: project.idProject}});
    response.wells = [];
    response.groups = groups;
    response.plots = plots;
    response.crossplots = crossplots;
    response.histograms = histograms;
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
                                    // where: {
                                    //     isDefault: true
                                    // }
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
                    include: {model: dbConnection.Zone, include: {model: dbConnection.ZoneTemplate}}
                }).then(zonesets => {
                    cb(null, zonesets);
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
            },
            function (cb) {
                dbConnection.MarkerSet.findAll({
                    where: {idWell: well.idWell},
                    include: {model: dbConnection.Marker, include: {model: dbConnection.MarkerTemplate}}
                }).then(markersets => {
                    cb(null, markersets);
                });
            }
        ], function (err, result) {
            wellObj.datasets = result[0];
            wellObj.zonesets = result[1];
            wellObj.combined_boxes = result[2];
            wellObj.wellheaders = result[3];
            wellObj.markersets = result[4];
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

function closeProject(payload, done, dbConnection, username) {
    let openingProject = require('../authenticate/opening-project');
    openingProject.removeRow({username: username}).then(() => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful"));
    });
}

function listProjectOffAllUser(payload, done, dbConnection) {
    const sequelize = require('sequelize');
    getDatabases().then(databaseList => {
        let response = [];
        asyncLoop(databaseList, (db, next) => {
            let query = "SELECT * FROM " + db + ".project";
            dbConnection.sequelize.query(query, {type: sequelize.QueryTypes.SELECT}).then(projects => {
                projects.forEach(project => {
                    response.push(project);
                });
                next();
            });
        }, function () {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Done", response));
        });
    });
}

module.exports = {
    createNewProject: createNewProject,
    editProject: editProject,
    getProjectInfo: getProjectInfo,
    getProjectList: getProjectList,
    deleteProject: deleteProject,
    getProjectFullInfo: getProjectFullInfo,
    closeProject: closeProject,
    updatePermission: updatePermission,
    listProjectOffAllUser: listProjectOffAllUser
};
