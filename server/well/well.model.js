"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let config = require('config');
let fs = require('fs');
let asyncEach = require('async/each');
let asyncParallel = require('async/parallel');
let fsExtra = require('fs-extra');
let importFromInventory = require('../import-from-inventory/import.model');

function createNewWell(wellInfo, done, dbConnection) {
    let Well = dbConnection.Well;
    Well.sync()
        .then(
            function () {
                let well = Well.build({
                    idProject: wellInfo.idProject,
                    name: wellInfo.name,
                    topDepth: wellInfo.topDepth,
                    bottomDepth: wellInfo.bottomDepth,
                    step: wellInfo.step
                });
                well.save()
                    .then(function (well) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new well success", well.toJSON()));
                    })
                    .catch(function (err) {
                        // console.log(err);
                        if (err.name === "SequelizeUniqueConstraintError") {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well name existed!"));
                        } else {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                        }
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}

function editWell(wellInfo, done, dbConnection, username) {
    dbConnection.Well.findById(wellInfo.idWell).then(well => {
        if (well) {
            if (well.name != wellInfo.name) {
                let oldWellName = well.name;
                well.name = wellInfo.name;
                well.topDepth = wellInfo.topDepth;
                well.bottomDepth = wellInfo.bottomDepth;
                well.step = wellInfo.step;
                well.idGroup = wellInfo.idGroup;
                well.save()
                    .then(function () {
                        dbConnection.Project.findById(well.idProject).then(function (project) {
                            dbConnection.Dataset.findAll({
                                where: {idWell: well.idWell},
                                paranoid: false
                            }).then(function (datasets) {
                                asyncEach(datasets, function (dataset, nextDataset) {
                                    dbConnection.Curve.findAll({
                                        where: {idDataset: dataset.idDataset},
                                        paranoid: false
                                    }).then(function (curves) {
                                        asyncEach(curves, function (curve, next) {
                                            let path = hashDir.createPath(config.curveBasePath, username + project.name + oldWellName + dataset.name + curve.name, curve.name + '.txt');
                                            let newPath = hashDir.createPath(config.curveBasePath, username + project.name + wellInfo.name + dataset.name + curve.name, curve.name + '.txt');
                                            let copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
                                            copy.on('close', function () {
                                                hashDir.deleteFolder(config.curveBasePath, username + project.name + oldWellName + dataset.name + curve.name);
                                                next();
                                            });
                                            copy.on('error', function (err) {
                                                next(err);
                                            });
                                        }, function (err) {
                                            if (err) nextDataset(err);
                                            nextDataset();
                                        });
                                    });
                                }, function (err) {
                                    if (err) {
                                        if (err.name === "SequelizeUniqueConstraintError") {
                                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well name existed!"));
                                        } else {
                                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                                        }
                                    }
                                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", well));
                                });
                            });
                        });
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well name existed!", err.name));
                    });
            } else {
                well.topDepth = wellInfo.topDepth;
                well.bottomDepth = wellInfo.bottomDepth;
                well.step = wellInfo.step;
                well.idGroup = wellInfo.idGroup;
                well.save()
                    .then(function () {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Well success", well));
                    })
                    .catch(function (err) {
                        if (err.name === "SequelizeUniqueConstraintError") {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well name existed!"));
                        } else {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                        }
                    });
            }
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No well found!"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}

function deleteWell(wellInfo, done, dbConnection) {
    let Well = dbConnection.Well;
    Well.findById(wellInfo.idWell)
        .then(function (well) {
            well.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Well is deleted", well));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Well" + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Well not found for delete"));
        })
}

function getWellInfo(well, done, dbConnection) {
    let Well = dbConnection.Well;
    Well.findById(well.idWell, {include: [{all: true, include: [{all: true}]}]})
        .then(function (well) {
            if (!well) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Well success", well));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Well not found for get info"));
        })
}

async function exportToProject(info, done, dbConnection, username) {
    let idDesProject = info.idDesProject;
    let fullWellData = await dbConnection.Well.findById(info.idWell, {
        include: {
            model: dbConnection.Dataset,
            include: dbConnection.Curve
        }
    });
    let srcProject = await dbConnection.Project.findById(fullWellData.idProject);
    let desProject = await dbConnection.Project.findById(idDesProject);
    dbConnection.Well.create({
        name: fullWellData.name,
        topDepth: fullWellData.topDepth,
        bottomDepth: fullWellData.bottomDepth,
        step: fullWellData.step,
        idProject: idDesProject
    }).then(well => {
        asyncEach(fullWellData.datasets, function (dataset, nextDataset) {
            dbConnection.Dataset.create({
                name: dataset.name,
                datasetLabel: dataset.datasetLabel,
                datasetKey: dataset.datasetKey,
                idWell: well.idWell
            }).then(newDataset => {
                asyncEach(dataset.curves, function (curve, nextCurve) {
                    dbConnection.Curve.create({
                        name: curve.name,
                        unit: curve.unit,
                        initValue: curve.initValue,
                        idDataset: newDataset.idDataset,
                        idFamily: curve.idFamily
                    }).then(newCurve => {
                        let oldPath = hashDir.createPath(config.curveBasePath, username + srcProject.name + fullWellData.name + dataset.name + curve.name, curve.name + '.txt');
                        let cpPath = hashDir.createPath(config.curveBasePath, username + desProject.name + well.name + newDataset.name + newCurve.name, newCurve.name + '.txt');
                        fsExtra.copy(oldPath, cpPath, function (err) {
                            if (err) {
                                console.log("Copy file error ", err);
                            }
                            console.log("Done : ", cpPath);
                            nextCurve();
                        });
                    });
                }, function () {
                    nextDataset();
                    //done all curve
                });
            });
        }, function () {
            //done all dataset
            done(ResponseJSON(ErrorCodes.SUCCESS, "", well));
        });
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well name existed!", well));
        console.log(err);
    });
};

function getWellHeader(idWell, done, dbConnection) {
    dbConnection.WellHeader.findAll({where: {idWell: idWell}}).then(headers => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", headers));
    });
}

function updateWellHeader(payload, done, dbConnection) {
    if (payload.idWellHeader) {
        dbConnection.WellHeader.findById(payload.idWellHeader).then((header) => {
            header.value = payload.value;
            header.save().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", header));
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            })
        });
    } else {
        dbConnection.WellHeader.findOrCreate({
            where: {
                idWell: payload.idWell,
                header: payload.header
            }, defaults: {header: payload.header, value: payload.value, idWell: payload.idWell}
        }).then(rs => {
            if (rs[1]) {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull created new header", rs[0]));
                //created
            } else {
                //found
                rs[0].value = payload.value;
                rs[0].save().then(() => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull update header", rs[0]));
                }).catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error " + err.message, err));
                });
            }
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error " + err.message, err));
        });
    }
}

function bulkUpdateWellHeader(headers, idWell, done, dbConnection) {
    let response = [];
    asyncEach(headers, function (header, next) {
        dbConnection.WellHeader.findOrCreate({
            where: {idWell: idWell, header: header.header},
            defaults: {idWell: idWell, header: header.header, value: header.value}
        }).then(rs => {
            if (rs[1]) {
                //create
                response.push({header: header, result: "CREATED"});
                next();
            } else {
                //found
                rs[0].value = header.value;
                rs[0].save().then(() => {
                    response.push({header: header, result: "UPDATED"});
                    next();
                }).catch(err => {
                    response.push({header: header, result: "ERROR : " + err.message});
                    next();
                });
            }
        }).catch(err => {
            console.log(err);
            response.push({header: header, result: "Error " + err});
            next();
        })
    }, function () {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", response));
    });
}


function importWell(payload, done, dbConnection, username, token) {
    importFromInventory.importWell(payload, token, function (err, res) {
        if (err) {
            // console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "error", err.message));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", res));
        }
    }, dbConnection, username);
}

module.exports = {
    createNewWell: createNewWell,
    editWell: editWell,
    deleteWell: deleteWell,
    getWellInfo: getWellInfo,
    exportToProject: exportToProject,
    getWellHeader: getWellHeader,
    updateWellHeader: updateWellHeader,
    bulkUpdateWellHeader: bulkUpdateWellHeader,
    importWell: importWell
};
