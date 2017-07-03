var models = require('../models');
var Plot = models.Plot;

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
                        console.log(plot.idPlot);
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            },
            function (err) {
                console.log(err);
            }
        )
}
var plotEx = {
    "type": "plot",
    "idWell": 123,
    "name": "Ex-Plot",
    "option": "blank-plot",
};
// createNewPlot(plotEx);
