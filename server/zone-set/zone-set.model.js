let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncEach = require('async/each');

function createNewZoneSet(zoneSetInfo, done, dbConnection) {
    let ZoneSet = dbConnection.ZoneSet;
    ZoneSet.sync()
        .then(
            function () {
                delete zoneSetInfo.idZoneSet;
                let zoneSet = ZoneSet.build(zoneSetInfo);
                zoneSet.save()
                    .then(function (zoneSet) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ZoneSet success", zoneSet));
                    })
                    .catch(function (err) {
                        if (err.name === "SequelizeUniqueConstraintError") {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Zoneset name existed!"));
                        } else {
                            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                        }
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}

function editZoneSet(zoneSetInfo, done, dbConnection) {
    delete zoneSetInfo.createdBy;
    let ZoneSet = dbConnection.ZoneSet;
    ZoneSet.findById(zoneSetInfo.idZoneSet)
        .then(function (zoneSet) {
            zoneSet = Object.assign(zoneSet, zoneSetInfo);
            zoneSet.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit zoneSet success", zoneSetInfo));
                })
                .catch(function (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Zoneset name existed!"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for edit"))
        });
}

function deleteZoneSet(zoneSetInfo, done, dbConnection) {
    let ZoneSet = dbConnection.ZoneSet;
    ZoneSet.findById(zoneSetInfo.idZoneSet)
        .then(function (zoneSet) {
            zoneSet.setDataValue('updatedBy', zoneSetInfo.updatedBy);
            zoneSet.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "ZoneSet is deleted", zoneSet));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete ZoneSet " + err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for delete"));
        })
}

function getZoneSetInfo(zoneSet, done, dbConnection) {
    let ZoneSet = dbConnection.ZoneSet;
    ZoneSet.findById(zoneSet.idZoneSet, {include: [{all: true}]})
        .then(function (zoneSet) {
            if (!zoneSet) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info ZoneSet success", zoneSet));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for get info"));
        })
}

function getZoneSetList(setInfo, done, dbConnection) {
    let ZoneSet = dbConnection.ZoneSet;
    ZoneSet.findAll({where: {idWell: setInfo.idWell}})
        .then(function (zoneSetList) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get list zoneset success", zoneSetList));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "get zone-set list error"));
        })
}

async function duplicateZoneSet(data, done, dbConnection) {
    let zoneset = await dbConnection.ZoneSet.findById(data.idZoneSet, {include: {all: true}});
    let newZoneset = zoneset.toJSON();
    delete newZoneset.idZoneSet;
    newZoneset.name = zoneset.name + '_Copy_' + zoneset.duplicated;
    zoneset.duplicated++;
    newZoneset.createdBy = data.createdBy;
    newZoneset.updatedBy = data.updatedBy;
    await zoneset.save();
    let _zoneset = await dbConnection.ZoneSet.create(newZoneset);
    asyncEach(newZoneset.zones, function (zone, next) {
        delete zone.idZone;
        zone.idZoneSet = _zoneset.idZoneSet;
        dbConnection.Zone.create(zone).then(() => {
            next();
        }).catch(err => {
            next();
        });
    }, function (err) {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", _zoneset));
    });
}

module.exports = {
    createNewZoneSet: createNewZoneSet,
    deleteZoneSet: deleteZoneSet,
    editZoneSet: editZoneSet,
    getZoneSetInfo: getZoneSetInfo,
    getZoneSetList: getZoneSetList,
    duplicateZoneSet: duplicateZoneSet
};

