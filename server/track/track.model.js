var models = require('../models');
var Track = models.Track;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewTrack(trackInfo,done) {
    Track.sync()
        .then(
            function () {
                var track = Track.build({
                    idPlot:trackInfo.idPlot
                });
                track.save()
                    .then(function (track) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Success", {idTrack: track.idTrack}));
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
function deleteTrack(trackInfo, done) {

}
var trackEx = {
    "type": "track",
    "idPlot": 444
};
// createNewTrack(trackEx);
module.exports = {
    createNewTrack:createNewTrack,
    deleteTrack:deleteTrack
};