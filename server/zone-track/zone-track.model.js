let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewZoneTrack(zoneTrackInfo, done, dbConnection) {
    let ZoneTrack = dbConnection.ZoneTrack;
    ZoneTrack.sync()
        .then(
            function () {
                delete zoneTrackInfo.idZoneTrack;
                let zoneTrack = ZoneTrack.build(zoneTrackInfo);
                zoneTrack.save()
                    .then(function (zoneTrack) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ZoneTrack success", {
                            idZoneTrack: zoneTrack.idZoneTrack,
                            orderNum: zoneTrack.orderNum
                        }));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new ZoneTrack " + err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editZoneTrack(zoneTrackInfo, done, dbConnection) {
    delete zoneTrackInfo.createdBy;
    let ZoneTrack = dbConnection.ZoneTrack;
    ZoneTrack.findByPk(zoneTrackInfo.idZoneTrack)
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

function deleteZoneTrack(zoneTrackInfo, done, dbConnection) {
    let ZoneTrack = dbConnection.ZoneTrack;
    ZoneTrack.findByPk(zoneTrackInfo.idZoneTrack)
        .then(function (zoneTrack) {
            zoneTrack.setDataValue('updatedBy', zoneTrackInfo.updatedBy);
            zoneTrack.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "ZoneTrack is deleted", zoneTrack));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete ZoneTrack " + err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneTrack not found for delete"));
        })
}

function getZoneTrackInfo(zoneTrack, done, dbConnection) {
    let ZoneTrack = dbConnection.ZoneTrack;
    ZoneTrack.findByPk(zoneTrack.idZoneTrack, {
        include: {
            model: dbConnection.ZoneSet,
            include: {model: dbConnection.Zone, include: {model: dbConnection.ZoneTemplate}}
        }
    })
        .then(function (zoneTrack) {
            if (!zoneTrack) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info ZoneTrack success", zoneTrack));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneTrack not found for get info"));
        })
}

module.exports = {
    createNewZoneTrack: createNewZoneTrack,
    deleteZoneTrack: deleteZoneTrack,
    editZoneTrack: editZoneTrack,
    getZoneTrackInfo: getZoneTrackInfo
};

