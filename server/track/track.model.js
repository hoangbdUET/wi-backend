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
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Track success", {idTrack: track.idTrack}));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Track "+err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}
function deleteTrack(trackInfo, done) {
    Track.findById(trackInfo.idTrack)
        .then(function (track) {
            track.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Track is deleted", track));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Track "+err.errors[0].message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for delete"));
        })
}
function getTrackInfo(track,done) {
    Track.findById(track.idTrack, {include: [{all: true}]})
        .then(function (track) {
            if (!track) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Track success", track));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Track not found for get info"));
        })
}

module.exports = {
    createNewTrack:createNewTrack,
    deleteTrack:deleteTrack,
    getTrackInfo:getTrackInfo
};