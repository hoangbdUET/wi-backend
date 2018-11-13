let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewRegressionLine(regressionLineInfo, done, dbConnection) {
    let RegressionLine = dbConnection.RegressionLine;
    RegressionLine.sync()
        .then(function () {
            delete regressionLineInfo.idRegressionLine;
            regressionLineInfo.lineStyle = JSON.stringify(regressionLineInfo.lineStyle);
            RegressionLine.build(regressionLineInfo)
                .save()
                .then(function (regressionLine) {
                    if (regressionLineInfo.polygons.length > 0) {
                        regressionLine.setPolygons(regressionLineInfo.polygons)
                            .then(function (rs) {
                                let id = rs[0][0].dataValues.idRegressionLine;
                                RegressionLine.findById(id, {include: [{all: true}]}).then(res => {
                                    done(ResponseJSON(ErrorCodes.SUCCESS, "Save polygon_regressionLine success", res));
                                }).catch(err => {
                                    done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "loi roi em eiiiiiii", "LOL"));
                                });
                            })
                            .catch(function (err) {
                                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "polygonId invalid: " + err));
                            })
                    } else {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", regressionLine));
                    }
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new regressionLine" + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })
}

function editRegressionLine(regressionLineInfo, done, dbConnection) {
    delete regressionLineInfo.createdBy;
    let RegressionLine = dbConnection.RegressionLine;
    RegressionLine.findById(regressionLineInfo.idRegressionLine)
        .then(function (regressionLine) {
            delete regressionLineInfo.idRegressionLine;
            delete regressionLineInfo.idPolygon;//forbid changing Polygon it belongto
            delete regressionLineInfo.idCrossPlot;//forbid changing Crossplot it belongto
            regressionLineInfo.lineStyle = JSON.stringify(regressionLineInfo.lineStyle);
            Object.assign(regressionLine, regressionLineInfo)
                .save()
                .then(async function (result) {
                    await result.setPolygons(regressionLineInfo.polygons);
                    RegressionLine.findById(result.idRegressinLine, {include: {all: true}}).then(rl => {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Edit regressionLine success", rl));
                    });
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit regressionLine" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "RegressionLine not found for edit"));
        })
}

function deleteRegressionLine(regressionLineInfo, done, dbConnection) {
    let RegressionLine = dbConnection.RegressionLine;
    RegressionLine.findById(regressionLineInfo.idRegressionLine)
        .then(function (regressionLine) {
            regressionLine.setDataValue('updatedBy', regressionLineInfo.updatedBy);
            regressionLine.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "RegressionLine is deleted", regressionLine));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete RegressionLine" + err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "RegressionLine not found for delete"));
        })
}

function getRegressionLineInfo(regressionLineInfo, done, dbConnection) {
    let RegressionLine = dbConnection.RegressionLine;
    RegressionLine.findById(regressionLineInfo.idRegressionLine, {
        include: [
            {
                model: dbConnection.Polygon
            }
        ]
    })
        .then(function (regressionLine) {
            if (!regressionLine) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get regressionLine info success", regressionLine))
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "RegressionLine not found for get info"));
        })
}

module.exports = {
    createNewRegressionLine: createNewRegressionLine,
    editRegressionLine: editRegressionLine,
    deleteRegressionLine: deleteRegressionLine,
    getRegressionLineInfo: getRegressionLineInfo
};

