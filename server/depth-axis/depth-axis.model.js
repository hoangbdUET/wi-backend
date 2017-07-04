var models = require('../models');
var DepthAxis=models.DepthAxis;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewDepthAxis(depthAxisInfo,done) {
    DepthAxis.sync()
        .then(function () {
            var depthAxis = DepthAxis.build({
                idPlot:depthAxisInfo.idPlot
            });
            depthAxis.save()
                .then(function (depthAxis) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Success", {idDepthAxis: depthAxis.idDepthAxis}));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.name));
                })
        },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}
function deleteDepthAxis(depthAxisInfo,done) {
    DepthAxis.findById(depthAxisInfo.idDepthAxis)
        .then(function (depthAxis) {
            depthAxis.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Deleted", depthAxis));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        })

}
function getDepthAxisInfo(depthAxis, done) {
    DepthAxis.findById(depthAxis.idDepthAxis, {include: [{all: true}]})
        .then(function (depthAxis) {
            if (!depthAxis) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Success", depthAxis));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Not found"));
        });
}
module.exports = {
    createNewDepthAxis:createNewDepthAxis,
    deleteDepthAxis:deleteDepthAxis,
    getDepthAxisInfo:getDepthAxisInfo
};