'use strict';

let models = require('../models');
let CurveData = models.CurveData;
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewCurveData(curveDataInfo, done) {
    CurveData.sync()
        .then(function () {
           let curveData =  CurveData.build({
               idCurve:curveDataInfo.idCurve,
               name:curveDataInfo.name,
               unit:curveDataInfo.unit,
               description:curveDataInfo.description,
               path:curveDataInfo.path
           });
           curveData.save()
               .then(function (curveData) {
                   done(ResponseJSON(ErrorCodes.SUCCESS, "Create CurveData Success", curveData));
               })
               .catch(function (err) {
                   done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create CurveData " + err.name));
               });
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        });
}

module.exports.createNewCurveData = createNewCurveData;