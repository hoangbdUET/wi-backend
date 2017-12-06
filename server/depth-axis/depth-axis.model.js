var models = require('../models');
var DepthAxis = models.DepthAxis;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewDepthAxis(depthAxisInfo, done, dbConnection) {
    //console.log(depthAxisInfo);
    var DepthAxis = dbConnection.DepthAxis;
    DepthAxis.sync()
        .then(function () {
                var depthAxis = DepthAxis.build({
                    idPlot: depthAxisInfo.idPlot,
                    orderNum: depthAxisInfo.orderNum,
                    showTitle: depthAxisInfo.showTitle,
                    trackBackground: depthAxisInfo.trackBackground,
                    title: depthAxisInfo.title,
                    justification: depthAxisInfo.justification,
                    depthType: depthAxisInfo.depthType,
                    unitType: depthAxisInfo.unitType,
                    decimals: depthAxisInfo.decimals,
                    geometryWidth: depthAxisInfo.geometryWidth,
                    width: depthAxisInfo.width || 0.5
                });
                depthAxis.save()
                    .then(function (depthAxis) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Depth-Axis success", depthAxis));
                    })
                    .catch(function (err) {
                        //console.log(err);
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editDepthAxis(depthAxisInfo, done, dbConnection) {
    var DepthAxis = dbConnection.DepthAxis;
    DepthAxis.findById(depthAxisInfo.idDepthAxis)
        .then(function (depthAxis) {
            delete depthAxisInfo.idPlot;
            delete depthAxisInfo.idDepthAxis;
            Object.assign(depthAxis, depthAxisInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Depth Axis success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Depth Axis" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Depth Axis not found for edit"));
        })
}

function deleteDepthAxis(depthAxisInfo, done, dbConnection) {
    var DepthAxis = dbConnection.DepthAxis;
    DepthAxis.findById(depthAxisInfo.idDepthAxis)
        .then(function (depthAxis) {
            depthAxis.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Depth-Axis is deleted", depthAxis));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Depth-Axis " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Depth-Axis not found for delete"));
        })

}

function getDepthAxisInfo(depthAxis, done, dbConnection) {
    var DepthAxis = dbConnection.DepthAxis;
    DepthAxis.findById(depthAxis.idDepthAxis, {include: [{all: true}]})
        .then(function (depthAxis) {
            if (!depthAxis) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Depth-Axis success", depthAxis));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Depth-Axis not found for get info"));
        });
}

module.exports = {
    createNewDepthAxis: createNewDepthAxis,
    deleteDepthAxis: deleteDepthAxis,
    editDepthAxis: editDepthAxis,
    getDepthAxisInfo: getDepthAxisInfo
};
