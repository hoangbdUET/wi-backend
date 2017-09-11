// var models = require('../models');
// var Well = models.Well;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewWell(wellInfo, done,dbConnection) {
    var Well = dbConnection.Well;
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
function editWell(wellInfo, done,dbConnection) {
    var Well = dbConnection.Well;
    Well.findById(wellInfo.idWell)
        .then(function (well) {
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
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Well "+err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Well not found for edit"));
        })
}
function deleteWell(wellInfo,done,dbConnection) {
    var Well = dbConnection.Well;
    Well.findById(wellInfo.idWell)
        .then(function (well) {
            well.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Well is deleted", well));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Well"+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Well not found for delete"));
        })
}
function getWellInfo(well,done,dbConnection) {
    var Well = dbConnection.Well;
    Well.findById(well.idWell,{include:[{all:true,include:[{all:true}]}]})
        .then(function (well) {
            if (!well) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Well success", well));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Well not found for get info"));
        })
}

module.exports = {
    createNewWell:createNewWell,
    editWell:editWell,
    deleteWell:deleteWell,
    getWellInfo:getWellInfo
};
