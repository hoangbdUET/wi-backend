var models = require('../models');
var config = require('config');
var Curve = models.Curve;
var exporter = require('./export');
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
                if (!result) {
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
        .then(() => {
                var curve = Curve.build({
                    idDataset: curveInfo.idDataset,
                    name: curveInfo.name,
                    dataset: curveInfo.dataset,
                    unit: curveInfo.unit,
                    initValue: curveInfo.initValue
                });
                curve.save()
                    .then(curve => {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", {idCurve: curve.idCurve}))
                    })
                    .catch(err => {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Curve "+err));
                    });
            },
            () => {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}
function editCurve(curveInfo, done) {
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            curve.idDataset = curveInfo.idDataset;
            curve.name = curveInfo.name;
            curve.dataset = curveInfo.dataset;
            curve.unit = curveInfo.unit;
            curve.initValue = curveInfo.initValue;
            curve.save()
                .then(() => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", curveInfo));
                })
                .catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve "+err.name));
                })
        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for edit"));
        })
}
function deleteCurve(curveInfo, done) {
    Curve.findById(curveInfo.idCurve)
        .then(curve => {
            curve.destroy()
                .then(() => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Curve is deleted", curve));
                })
                .catch(err => {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Curve "+err.errors[0].message));
                })
        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for delete"));
        })
}
function getCurveInfo(curve, done) {
    Curve.findById(curve.idCurve, {include: [{all: true}]})
        .then(curve => {
            if (!curve) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
        })
        .catch(() => {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for get info"));
        });
}
function getData(param, successFunc, errorFunc) {
    Curve.findById(param.idCurve)
        .then(curve => {
            console.log("000000000000000000", curve.dataset, curve.name, config.curveBasePath);
            successFunc( hashDir.createJSONReadStream(config.curveBasePath, curve.dataset + curve.name, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n') );
        })
        .catch(() => {
            errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
        });
}
function exportData(param, successFunc, errorFunc) {
    Curve.findById(param.idCurve)
        .then(function (curve) {
            exporter.exportData(hashDir.createReadStream(config.curveBasePath, curve.dataset + curve.name, curve.name + '.txt'), successFunc);
        })
        .catch(function () {
            errorFunc(404);
        })
}
module.exports = {
    createNewCurve:createNewCurve,
    editCurve:editCurve,
    deleteCurve:deleteCurve,
    getCurveInfo:getCurveInfo,
    getData: getData,
    exportData: exportData
};

