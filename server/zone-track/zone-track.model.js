var models = require('../models');
var ZoneTrack = models.ZoneTrack;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewZoneTrack(zoneTrackInfo,done) {
    ZoneTrack.sync()
        .then(
            function () {
                delete zoneTrackInfo.idZoneTrack;
                var zoneTrack = ZoneTrack.build(zoneTrackInfo);
                zoneTrack.save()
                    .then(function (zoneTrack) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ZoneTrack success", {idZoneTrack: zoneTrack.idZoneTrack, orderNum: zoneTrack.orderNum}));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new ZoneTrack "+err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}
function editZoneTrack(zoneTrackInfo, done) {
    ZoneTrack.findById(zoneTrackInfo.idZoneTrack)
        .then(function (zoneTrack) {
            zoneTrack = Object.assign(zoneTrack, zoneTrackInfo);
            zoneTrack.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit zoneTrack success", zoneTrackInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit zoneTrack" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneTrack not found for edit"))
        });
}
function deleteZoneTrack(zoneTrackInfo, done) {
    ZoneTrack.findById(zoneTrackInfo.idZoneTrack)
        .then(function (zoneTrack) {
            zoneTrack.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "ZoneTrack is deleted", zoneTrack));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete ZoneTrack "+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneTrack not found for delete"));
        })
}
function getZoneTrackInfo(zoneTrack,done) {
    ZoneTrack.findById(zoneTrack.idZoneTrack, {include: [{all: true}]})
        .then(function (zoneTrack) {
            if (!zoneTrack) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info ZoneTrack success", zoneTrack));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneTrack not found for get info"));
        })
}

module.exports = {
    createNewZoneTrack:createNewZoneTrack,
    deleteZoneTrack:deleteZoneTrack,
    editZoneTrack:editZoneTrack,
    getZoneTrackInfo:getZoneTrackInfo
};

