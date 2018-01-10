// var models = require('../models');
// var Shading=models.Shading;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewShading(shadingInfo, done, dbConnection) {
    var Shading = dbConnection.Shading;
    Shading.sync()
        .then(
            function () {
                var shading = Shading.build({
                    idTrack: shadingInfo.idTrack,
                    idLeftLine: shadingInfo.idLeftLine,
                    idRightLine: shadingInfo.idRightLine,
                    name: shadingInfo.name,
                    leftFixedValue: shadingInfo.leftFixedValue,
                    rightFixedValue: shadingInfo.rightFixedValue,
                    isNegPosFill: shadingInfo.isNegPosFill,
                    negativeFill: JSON.stringify(shadingInfo.negativeFill),
                    positiveFill: JSON.stringify(shadingInfo.positiveFill),
                    fill: JSON.stringify(shadingInfo.fill),
                    isNegPosFill: shadingInfo.isNegPosFill,
                    idControlCurve: shadingInfo.idControlCurve,
                    orderNum: shadingInfo.orderNum
                });
                shading.save()
                    .then(function (result) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new shading success", result));
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

function _editShading(shadingInfo, done, dbConnection) {
    delete shadingInfo.changed;
    var Shading = dbConnection.Shading;
    Shading.findById(shadingInfo.idShading)
        .then(function (shading) {
            shadingInfo.positiveFill = JSON.stringify(shadingInfo.positiveFill);
            shadingInfo.negativeFill = JSON.stringify(shadingInfo.negativeFill);
            shadingInfo.fill = JSON.stringify(shadingInfo.fill);
            Object.keys(shadingInfo).forEach(prop => shading[prop] = shadingInfo[prop]);
            delete shading.idShading;

            shading.save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit shading success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit shading" + err));
                })
        })
        .catch(function (err) {
            console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Shading not found for edit", err.message));
        })
}

function editShading(shadingInfo, done, dbConnection) {
    // console.log(shadingInfo);
    delete shadingInfo.changed;
    shadingInfo.negativeFill = JSON.stringify(shadingInfo.negativeFill);
    shadingInfo.fill = JSON.stringify(shadingInfo.fill);
    shadingInfo.positiveFill = JSON.stringify(shadingInfo.positiveFill);
    dbConnection.Shading.findById(shadingInfo.idShading).then(shading => {
        if (shading) {
            Object.assign(shading, shadingInfo).save().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Err", err));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Shading not found for edit"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Shading not found for edit", err.message));
    });
};

function deleteShading(shadingInfo, done, dbConnection) {
    var Shading = dbConnection.Shading;
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
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Shading not found for delete"))
        })
}

function getShadingInfo(shading, done, dbConnection) {
    var Shading = dbConnection.Shading;
    Shading.findById(shading.idShading)
        .then(function (shading) {
            if (!shading) throw "not exists";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info shading success", shading));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Shading not found for get info"))
        })
}

module.exports = {
    createNewShading: createNewShading,
    editShading: editShading,
    deleteShading: deleteShading,
    getShadingInfo: getShadingInfo
};
