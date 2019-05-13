let models = require('../models');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewDepthAxis(depthAxisInfo, done, dbConnection) {
    let DepthAxis = dbConnection.DepthAxis;
    depthAxisInfo.width = depthAxisInfo.width || 0.5;
    DepthAxis.create(depthAxisInfo)
        .then(function (depthAxis) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Depth-Axis success", depthAxis));
        })
        .catch(function (err) {
            //console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message));
        })
    // DepthAxis.sync()
    //     .then(function () {
    //             // let depthAxis = DepthAxis.build({
    //             //     idPlot: depthAxisInfo.idPlot,
    //             //     orderNum: depthAxisInfo.orderNum,
    //             //     showTitle: depthAxisInfo.showTitle,
    //             //     trackBackground: depthAxisInfo.trackBackground,
    //             //     title: depthAxisInfo.title,
    //             //     justification: depthAxisInfo.justification,
    //             //     depthType: depthAxisInfo.depthType,
    //             //     unitType: depthAxisInfo.unitType,
    //             //     decimals: depthAxisInfo.decimals,
    //             //     geometryWidth: depthAxisInfo.geometryWidth,
    //             //     width: depthAxisInfo.width || 0.5,
    //             //     createdBy: depthAxisInfo.createdBy,
    //             //     updatedBy: depthAxisInfo.updatedBy,
    //             //     idWell: depthAxisInfo.idWell
    //             // });
    //         },
    //         function () {
    //             done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
    //         }
    //     )
}

function editDepthAxis(depthAxisInfo, done, dbConnection) {
    delete depthAxisInfo.createdBy;
    let DepthAxis = dbConnection.DepthAxis;
    DepthAxis.findByPk(depthAxisInfo.idDepthAxis)
        .then(function (depthAxis) {
            delete depthAxisInfo.idPlot;
            delete depthAxisInfo.idDepthAxis;
            Object.assign(depthAxis, depthAxisInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Depth Axis success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Depth Axis not found for edit"));
        })
}

function deleteDepthAxis(depthAxisInfo, done, dbConnection) {
    let DepthAxis = dbConnection.DepthAxis;
    DepthAxis.findByPk(depthAxisInfo.idDepthAxis)
        .then(function (depthAxis) {
            depthAxis.setDataValue('updatedBy', depthAxisInfo.updatedBy);
            depthAxis.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Depth-Axis is deleted", depthAxis));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Depth-Axis " + err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Depth-Axis not found for delete"));
        })

}

function getDepthAxisInfo(depthAxis, done, dbConnection) {
    let DepthAxis = dbConnection.DepthAxis;
    DepthAxis.findByPk(depthAxis.idDepthAxis, {include: [{all: true}]})
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
