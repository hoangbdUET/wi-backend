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
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.errors[0].message));
                })
        },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}
function deleteDepthAxis() {

}
module.exports = {
    createNewDepthAxis:createNewDepthAxis,
    deleteDepthAxis:deleteDepthAxis
};