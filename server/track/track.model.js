var models = require('../models');
var Track = models.Track;

function createNewTrack(trackInfo,done) {
    Track.sync()
        .then(
            function () {
                var track = Track.build({
                    idPlot:trackInfo.idPlot
                });
                track.save()
                    .then(function () {

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
var trackEx = {
    "type": "track",
    "idPlot": 444
};
// createNewTrack(trackEx);