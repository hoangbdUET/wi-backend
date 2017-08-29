var models = require('../models');
var DepthAxis = models.DepthAxis;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewDepthAxis(depthAxisInfo, done) {
    //console.log(depthAxisInfo);
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
                    geometryWidth: depthAxisInfo.geometryWidth
                });
                depthAxis.save()
                    .then(function (depthAxisInfo) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Depth-Axis success", {
                            idPlot: depthAxisInfo.idPlot,
                            orderNum: depthAxisInfo.orderNum,
                            showTitle: depthAxisInfo.showTitle,
                            trackBackground: depthAxisInfo.trackBackground,
                            title: depthAxisInfo.title,
                            justification: depthAxisInfo.justification,
                            depthType: depthAxisInfo.depthType,
                            unitType: depthAxisInfo.unitType,
                            decimals: depthAxisInfo.decimals,
                            geometryWidth: depthAxisInfo.geometryWidth
                        }));
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

function deleteDepthAxis(depthAxisInfo, done) {
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

function getDepthAxisInfo(depthAxis, done) {
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
    getDepthAxisInfo: getDepthAxisInfo
};
