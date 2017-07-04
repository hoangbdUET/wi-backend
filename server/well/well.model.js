var models = require('../models');
var Well = models.Well;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewWell(wellInfo, done) {
    Well.sync()
        .then(
            function () {
                var well = Well.build({
                    idProject: wellInfo.idProject,
                    name: wellInfo.name,
                    topDepth:wellInfo.topDepth,
                    bottomDepth:wellInfo.bottomDepth,
                    step:wellInfo.step
                });
                well.save()
                    .then(function (well) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Success", {idWell: well.idWell}));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name+" idProject not exist"));
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}
function editWell(wellInfo, done) {
    Well.findById(wellInfo.idWell)
        .then(function (well) {
            well.idProject = wellInfo.idProject;
            well.name = wellInfo.name;
            well.topDepth = wellInfo.topDepth;
            well.bottomDepth = wellInfo.bottomDepth;
            well.step = wellInfo.step;
            well.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Success", wellInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Well not exist"));
        })
}
function deleteWell(wellInfo,done) {
    Well.findById(wellInfo.idWell)
        .then(function (well) {
            well.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Deleted", well));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        })
}
function getWellInfo(well,done) {
    Well.findById(well.idWell,{include:[{all:true}]})
        .then(function (well) {
            if (!well) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", well));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not Found"));
        })
}

module.exports = {
    createNewWell:createNewWell,
    editWell:editWell,
    deleteWell:deleteWell,
    getWellInfo:getWellInfo
};