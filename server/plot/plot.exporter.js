const fs = require('fs');
const curveFunction = require('../utils/curve.function');
const async = require('async');

function createTempfile(data, callback) {
    let tempfile = require('tempfile')('.json');
    fs.writeFileSync(tempfile, JSON.stringify(data));
    callback(200, tempfile);
}

module.exports = function (body, done, error, dbConnection, username) {
    dbConnection.Plot.findById(body.idPlot, {
        include: [
            {
                model: dbConnection.Track, include: [
                    {model: dbConnection.Line},
                    {model: dbConnection.Shading},
                    {model: dbConnection.Marker},
                    {model: dbConnection.Annotation}
                ]
            },
            {model: dbConnection.DepthAxis},
            {model: dbConnection.ImageTrack, include: {model: dbConnection.ImageOfTrack}},
            {model: dbConnection.ObjectTrack, include: {model: dbConnection.ObjectOfTrack}},
            {model: dbConnection.ZoneTrack, include: {model: dbConnection.ZoneSet}}
        ]
    }).then(plot => {
        if (!plot) throw "Not existed!";
        plot = plot.toJSON();
        curveFunction.getFullCurveParents({idCurve: plot.referenceCurve}, dbConnection).then(refCurve => {
            plot.reference_curve = refCurve;
            async.each(plot.tracks, function (track, nextTrack) {
                async.each(track.lines, function (line, nextLine) {
                    curveFunction.getFullCurveParents({idCurve: line.idCurve}, dbConnection).then(curveFullParents => {
                        line.curve = curveFullParents;
                        nextLine();
                    });
                }, function () {
                    async.each(track.shadings, function (shading, nextShading) {
                        curveFunction.getFullCurveParents({idCurve: shading.idControlCurve}, dbConnection).then(control_curve => {
                            dbConnection.Line.findById(shading.idLeftLine).then(left_line => {
                                dbConnection.Line.findById(shading.idRightLine).then(right_line => {
                                    shading.control_curve = control_curve;
                                    shading.left_line = left_line;
                                    shading.right_line = right_line;
                                    nextShading();
                                });
                            })
                        });
                    }, function () {
                        nextTrack();
                    });
                });
            }, function () {
                createTempfile(plot, done);
            });
        });
    }).catch(err => {
        error(404);
    });
};
