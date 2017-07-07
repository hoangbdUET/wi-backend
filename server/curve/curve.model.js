var models = require('../models');
var Curve = models.Curve;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewCurve(curveInfo,done) {
    Curve.sync()
        .then(function () {
                var curve = Curve.build({
                    idWell: curveInfo.idWell,
                    name: curveInfo.name,
                    dataset: curveInfo.dataset,
                    family: curveInfo.family,
                    unit: curveInfo.unit,
                    initValue: curveInfo.initValue
                });
                curve.save()
                    .then(function (curve) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Success", {idCurve: curve.idCurve}))
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name));
                    });
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
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not exist"));
        })
}
function deleteCurve(curveInfo, done) {
    Curve.findById(curveInfo.idCurve)
        .then(function (curve) {
            curve.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Deleted", curve));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        })
}
function getCurveInfo(curve, done) {
    Curve.findById(curve.idCurve, {include: [{all: true}]})
        .then(function (curve) {
            if (!curve) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", curve));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}

module.exports = {
    createNewCurve:createNewCurve,
    editCurve:editCurve,
    deleteCurve:deleteCurve,
    getCurveInfo:getCurveInfo
};

