let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewZone(zoneInfo, done, dbConnection) {
    let Zone = dbConnection.Zone;
    // zoneInfo.fill = JSON.stringify(zoneInfo.fill);
    Zone.sync()
        .then(
            function () {
                delete zoneInfo.idZone;
                let zone = Zone.build(zoneInfo);
                zone.save()
                    .then(function (zone) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Zone success", zone));
                    })
                    .catch(function (err) {
                        console.log(err);
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Zone " + err));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editZone(zoneInfo, done, dbConnection) {
    delete zoneInfo.createdBy;
    let Zone = dbConnection.Zone;
    Zone.findByPk(zoneInfo.idZone)
        .then(function (zone) {
            zone = Object.assign(zone, zoneInfo);
            zone.fill = JSON.stringify(zone.fill);
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

function deleteZone(zoneInfo, done, dbConnection) {
    let Zone = dbConnection.Zone;
    Zone.findByPk(zoneInfo.idZone)
        .then(function (zone) {
            zone.setDataValue('updatedBy', zoneInfo.updatedBy);
            zone.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Zone is deleted", zone));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Zone not found for delete"));
        })
}

function getZoneInfo(zone, done, dbConnection) {
    let Zone = dbConnection.Zone;
    Zone.findByPk(zone.idZone, {include: [{all: true}]})
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