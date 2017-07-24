var models = require('../models');
var config = require('config');
var Curve = models.Curve;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var FamilyCondition=models.FamilyCondition;

var wiImport = require('wi-import');
var hashDir = wiImport.hashDir;

Curve.hook('afterCreate',function (curve, options) {
    ((curveName, unit) => {
        FamilyCondition.findAll()
            .then(conditions => {
                var result = conditions.find(function (aCondition) {
                    return new RegExp("^" + aCondition.curveName + "$").test(curveName) && new RegExp("^" + aCondition.unit + "$").test(unit);
                });
                if (!result){
                    return;
                }
                result.getFamily()
                    .then(aFamily => {
                        curve.setLineProperty(aFamily);
                    })
            })
    })(curve.name, curve.unit);
});

function createNewCurve(curveInfo,done) {
    Curve.sync()
        .then(function () {
                var curve = Curve.build({
                    idDataset: curveInfo.idDataset,
                    name: curveInfo.name,
                    dataset: curveInfo.dataset,
                    family: curveInfo.family,
                    unit: curveInfo.unit,
                    path:"",
                    initValue: curveInfo.initValue
                });
                curve.save()
                    .then(function (curve) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", {idCurve: curve.idCurve}))
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Curve "+err));
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
            curve.idDataset = curveInfo.idDataset;
            curve.name = curveInfo.name;
            curve.dataset = curveInfo.dataset;
            curve.family = curveInfo.family;
            curve.unit = curveInfo.unit;
            curve.initValue = curveInfo.initValue;
            curve.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", curveInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve "+err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for edit"));
        })
}
function deleteCurve(curveInfo, done) {
    Curve.findById(curveInfo.idCurve)
        .then(function (curve) {
            curve.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Curve is deleted", curve));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Curve "+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for delete"));
        })
}
function getCurveInfo(curve, done) {
    Curve.findById(curve.idCurve, {include: [{all: true}]})
        .then(function (curve) {
            if (!curve) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for get info"));
        });
}
function genCurvePath(param) {
    return "";
}
function getData(param, successFunc, errorFunc) {
    Curve.findById(param.idCurve)
        .then(function(curve) {
            successFunc( hashDir.createJSONReadStream(config.curveBasePath, curve.path + curve.dataset + curve.name, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n') );
        })
        .catch(function() {
            errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
        });
}
module.exports = {
    createNewCurve:createNewCurve,
    editCurve:editCurve,
    deleteCurve:deleteCurve,
    getCurveInfo:getCurveInfo,
    getData: getData
};

