var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var models = require('../models');
var CrossPlot = models.CrossPlot;


function createNewCrossPlot(crossPlotInfo, done,dbConnection) {
    var CrossPlot=dbConnection.CrossPlot;
    CrossPlot.sync()
        .then(
            function () {
                var crossPlot = CrossPlot.build({
                    idWell:crossPlotInfo.idWell,
                    name: crossPlotInfo.name,
                });
                crossPlot.save()
                    .then(function (crossPlot) {
                        done(ResponseJSON(ErrorCodes.SUCCESS,"Create new CrossPlot success",crossPlot.toJSON()));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new CrossPlot "+err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editCrossPlot(crossPlotInfo,done,dbConnection) {
    var CrossPlot=dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            crossPlot.idWell = crossPlotInfo.idWell;
            crossPlot.name = crossPlotInfo.name;
            crossPlot.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit CrossPlot success", crossPlotInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit CrossPlot "+err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"CrossPlot not found for edit"));
        })
}
function deleteCrossPlot(crossPlotInfo,done,dbConnection) {
    var CrossPlot=dbConnection.CrossPlot;
    CrossPlot.findById(crossPlotInfo.idCrossPlot)
        .then(function (crossPlot) {
            crossPlot.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "CrossPlot is deleted", crossPlot));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete CrossPlot "+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot not found for delete"));
        })
}
function getCrossPlotInfo(crossPlot, done,dbConnection) {
    var CrossPlot=dbConnection.CrossPlot;
    CrossPlot.findById(crossPlot.idCrossPlot, {include: [{all:true,include:[{all:true}]}]})
        .then(function (crossPlot) {
            if (!crossPlot) throw "not exists";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info CrossPlot success", crossPlot));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "CrossPlot not found for get info"));
        })
}

module.exports = {
    createNewCrossPlot:createNewCrossPlot,
    editCrossPlot:editCrossPlot,
    deleteCrossPlot:deleteCrossPlot,
    getCrossPlotInfo:getCrossPlotInfo
};

