let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewPolygon(polygonInfo, done, dbConnection) {
    let Polygon = dbConnection.Polygon;
    Polygon.sync()
        .then(function () {
            delete polygonInfo.idPolygon;
            polygonInfo.points = JSON.stringify(polygonInfo.points);
            Polygon.build(polygonInfo)
                .save()
                .then(function (polygon) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new polygon success", polygon))
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new polygon" + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })
}

function editPolygon(polygonInfo, done, dbConnection) {
    delete polygonInfo.createdBy;
    let Polygon = dbConnection.Polygon;
    Polygon.findById(polygonInfo.idPolygon)
        .then(function (polygon) {
            delete polygonInfo.idPolygon;
            delete polygonInfo.idCrossPlot;//forbid changing CrossPlot it belongto
            polygonInfo.points = JSON.stringify(polygonInfo.points);
            Object.assign(polygon, polygonInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit polygon success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit polygon" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Polygon not found for edit"));
        })
}

function deletePolygon(polygonInfo, done, dbConnection) {
    let Polygon = dbConnection.Polygon;
    Polygon.findById(polygonInfo.idPolygon)
        .then(function (polygon) {
            polygon.setDataValue('updatedBy', polygonInfo.updatedBy);
            polygon.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Polygon is deleted", polygon));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Polygon not found for delete"));
        })
}

function getPolygonInfo(polygonInfo, done, dbConnection) {
    let Polygon = dbConnection.Polygon;
    Polygon.findById(polygonInfo.idPolygon)
        .then(function (polygon) {
            if (!polygon) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get polygon info success", polygon))
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Polygon not found for get info"));
        })
}

module.exports = {
    createNewPolygon: createNewPolygon,
    editPolygon: editPolygon,
    deletePolygon: deletePolygon,
    getPolygonInfo: getPolygonInfo
};

