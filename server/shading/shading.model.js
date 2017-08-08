var models = require('../models');
var Shading=models.Shading;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewShading(shadingInfo, done) {
    Shading.sync()
        .then(
            function () {
                var shading = Shading.build({
                    idShading: shadingInfo.idShading,
                    shadingName: shadingInfo.shadingName,
                    leftFixedValue: shadingInfo.leftFixedValue,
                    rightFixedValue: shadingInfo.rightFixedValue,
                    shadingStyle: shadingInfo.shadingStyle,
                    patternLeftForeground: shadingInfo.patternLeftForeground,
                    patternLeftBackground: shadingInfo.patternLeftBackground,
                    patternLeftName: shadingInfo.patternLeftName,
                    patternRightForeground: shadingInfo.patternRightForeground,
                    patternRightBackground: shadingInfo.patternRightBackground,
                    patternRightName: shadingInfo.patternRightName
                });
                shading.save()
                    .then(function (shading) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new shading success", shading.toJSON()));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new shading" + err));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));

            }
        )
}

function editShading(shadingInfo,done) {
    Shading.findById(shadingInfo.idShading)
        .then(function (shading) {
            shading.shadingName = shadingInfo.shadingName;
            shading.idLeftLine=shadingInfo.idLeftLine;
            shading.idRightLine = shadingInfo.idRightLine;
            shading.leftFixedValue = shadingInfo.leftFixedValue;
            shading.rightFixedValue = shadingInfo.rightFixedValue;
            shading.shadingStyle = shadingInfo.shadingStyle;
            shading.patternLeftName=shadingInfo.patternLeftName;
            shading.patternLeftForeground = shadingInfo.patternLeftForeground;
            shading.patternLeftBackground = shadingInfo.patternLeftBackground;
            shading.patternRightName = shadingInfo.patternRightName;
            shading.patternRightForeground = shadingInfo.patternRightForeground;
            shading.patternRightBackground = shadingInfo.patternRightBackground;
            shading.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit shading success", shadingInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit shading" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Shading not found for edit"));
        })


}
function deleteShading(shadingInfo, done) {
    Shading.findById(shadingInfo.idShading)
        .then(function (shading) {
            shading.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Shading is deleted", shading));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete shading" + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Shading not found for delete"))
        })
}
function getShadingInfo(shading, done) {
    Shading.findById(shading.idShading, {include: [{all: true}]})
        .then(function (shading) {
            if (!shading) throw "not exists";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info shading success", shading));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Shading not found for get info"))
        })
}

module.exports = {
    createNewShading:createNewShading,
    editShading:editShading,
    deleteShading:deleteShading,
    getShadingInfo:getShadingInfo
};