"use strict";

var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;
var config = require('config');
var fs = require('fs');

function createNewWell(wellInfo, done, dbConnection) {
    var Well = dbConnection.Well;
    Well.sync()
        .then(
            function () {
                var well = Well.build({
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
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err));
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}

function editWell(wellInfo, done, dbConnection, username) {
    let Well = dbConnection.Well;
    let Dataset = dbConnection.Dataset;
    let Curve = dbConnection.Curve;
    let Project = dbConnection.Project;
    Well.findById(wellInfo.idWell)
        .then(function (well) {
            Well.findOne({
                where: {
                    idProject: wellInfo.idProject,
                    name: wellInfo.name
                }
            }).then(w => {
                if (w) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well name exited!"));
                } else {
                    let oldWellName = well.name;
                    //console.log("EDIT NA~~~~~~~~~~~~~~~~~~~");
                    Project.findById(well.idProject).then(function (project) {
                        Dataset.findAll({where: {idWell: well.idWell}}).then(function (datasets) {
                            datasets.forEach(function (dataset) {
                                Curve.findAll({where: {idDataset: dataset.idDataset}}).then(function (curves) {
                                    curves.forEach(function (curve) {
                                        //let wellName = well.name;
                                        let path = hashDir.createPath(config.curveBasePath, username + project.name + oldWellName + dataset.name + curve.name, curve.name + '.txt');
                                        let newPath = hashDir.createPath(config.curveBasePath, username + project.name + wellInfo.name + dataset.name + curve.name, curve.name + '.txt');
                                        //console.log("Old Path : " + path);
                                        //console.log("New Path : " + newPath);
                                        try {
                                            var copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
                                            copy.on('close', function () {
                                                //console.log("deleete");
                                                hashDir.deleteFolder(config.curveBasePath, username + project.name + oldWellName + dataset.name + curve.name);
                                            });
                                            copy.on('error', function (err) {
                                                return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit well name", err));
                                                //console.log(err);
                                            });
                                        } catch (err) {
                                            console.log(err);
                                            return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit well name", err));
                                        }
                                    });
                                });
                            });
                        });
                    });
                    well.idProject = wellInfo.idProject;
                    well.name = wellInfo.name;
                    well.topDepth = wellInfo.topDepth;
                    well.bottomDepth = wellInfo.bottomDepth;
                    well.step = wellInfo.step;
                    well.save()
                        .then(function () {
                            done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Well success", wellInfo));
                        })
                        .catch(function (err) {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Well " + err.name));
                        })
                }
            }).catch();

        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Well not found for edit"));
        })
}

function deleteWell(wellInfo, done, dbConnection) {
    var Well = dbConnection.Well;
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
    var Well = dbConnection.Well;
    Well.findById(well.idWell, {include: [{all: true, include: [{all: true}]}]})
        .then(function (well) {
            if (!well) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Well success", well));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Well not found for get info"));
        })
}

module.exports = {
    createNewWell: createNewWell,
    editWell: editWell,
    deleteWell: deleteWell,
    getWellInfo: getWellInfo
};
