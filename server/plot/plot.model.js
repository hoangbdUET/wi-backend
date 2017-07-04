var models = require('../models');
var Plot = models.Plot;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewPlot(plotInfo, done) {
    Plot.sync()
        .then(
            function () {
                var plot = Plot.build({
                    idWell:plotInfo.idWell,
                    name: plotInfo.name,
                    option:plotInfo.option
                });
                plot.save()
                    .then(function (plot) {
                        done(ErrorCodes.SUCCESS,"Success",{idPlot:plot.idPlot});
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

function editPlot(plotInfo,done) {
    Plot.findById(plotInfo.idWell)
        .then(function (plot) {
            plot.idWell = plotInfo.idWell;
            plot.name = plotInfo.name;
            plot.option = plotInfo.option;
            plot.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Success", plotInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INCORRECT_FORMAT, err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Plot not exist"));
        })
}
function deletePlot(plotInfo,done) {

}
var plotEx = {
    "type": "plot",
    "idWell": 123,
    "name": "Ex-Plot",
    "option": "blank-plot",
};
// createNewPlot(plotEx);
module.exports = {
    createNewPlot:createNewPlot,
    editPlot:editPlot,
    deletePlot:deletePlot
};
