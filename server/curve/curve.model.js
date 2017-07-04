var models = require('../models');
var Curve = models.Curve;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewCurve(curveInfo,done) {
    Curve.sync()
        .then(function () {
                var curve=Curve.build({
                    idWell:curveInfo.idWell,
                    name: curveInfo.name,
                    dataset:curveInfo.dataset,
                    family:curveInfo.family,
                    unit: curveInfo.unit,
                    iniValue:curveInfo['iniValue']
                })
                curve.save()
                    .then(function (curve) {
                        done(ResponseJSON(ErrorCodes.SUCCESS,"Success",{idCurve:curve.idCurve}))
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.errors[0].message));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}
function editCurve(curveInfo, done) {
    Curve.findById(curveInfo.idCurve)
        .then(function (curve) {
            curve.idWell = curveInfo.idWell;
            curve.name = curveInfo.name;
            curve.dataset = curveInfo.dataset;
            curve.family = curveInfo.family;
            curve.unit = curveInfo.unit;
            curve.initValue = curveInfo.initValue;
            curve.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Success", curveInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not exist"));
        })
}
function deleteCurve(curveInfo, done) {

}
var curveEx = {
    "idWell": 132,
    "type": "curve",
    "name": "Ex-Curve",
    "dataset": "",
    "family": "Rate of opreration",
    "unit": "mn/m",
    "iniValue":"30"
};

module.exports = {
    createNewCurve:createNewCurve,
    editCurve:editCurve,
    deleteCurve:deleteCurve
};

