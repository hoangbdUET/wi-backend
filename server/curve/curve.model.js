var models = require('../models');
var Curve = models.Curve;

function createNewCurve(curveInfo,done) {
    Curve.sync()
        .then(function () {
                var curve=Curve.build({
                    idWell:curveInfo.idWell,
                    name: curveInfo.name,
                    dataset:curveInfo.dataset,
                    family:curveInfo.family,
                    unit: curveInfo.unit,
                    iniValue:curveInfo['iniValue']
                })
                curve.save()
                    .then()
                    .catch(function (err) {
                        console.log(err);
                    })
            },
            function (err) {
                console.log(err);
            }
        )

}
var curveEx = {
    "idWell": 132,
    "type": "curve",
    "name": "Ex-Curve",
    "dataset": "",
    "family": "Rate of opreration",
    "unit": "mn/m",
    "iniValue":"30"
};
// createNewCurve(curveEx);

