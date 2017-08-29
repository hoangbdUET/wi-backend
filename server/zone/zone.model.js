var models = require('../models');
var Zone = models.Zone;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewZone(zoneInfo, done) {
    zoneInfo.fill = JSON.stringify(zoneInfo.fill);
    Zone.sync()
        .then(
            function () {
                delete zoneInfo.idZone;
                var zone = Zone.build(zoneInfo);
                zone.save()
                    .then(function (zone) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Zone success", {
                            idZone: zone.idZone,
                            orderNum: zone.orderNum
                        }));
                    })
                    .catch(function (err) {
                        console.log(err);
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Zone " + err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editZone(zoneInfo, done) {
    Zone.findById(zoneInfo.idZone)
        .then(function (zone) {
            zone = Object.assign(zone, zoneInfo);
            zone.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit zone success", zoneInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit zone" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Zone not found for edit"))
        });
}

function deleteZone(zoneInfo, done) {
    Zone.findById(zoneInfo.idZone)
        .then(function (zone) {
            zone.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Zone is deleted", zone));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Zone " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Zone not found for delete"));
        })
}

function getZoneInfo(zone, done) {
    Zone.findById(zone.idZone, {include: [{all: true}]})
        .then(function (zone) {
            if (!zone) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Zone success", zone));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Zone not found for get info"));
        })
}

module.exports = {
    createNewZone: createNewZone,
    deleteZone: deleteZone,
    editZone: editZone,
    getZoneInfo: getZoneInfo
};


