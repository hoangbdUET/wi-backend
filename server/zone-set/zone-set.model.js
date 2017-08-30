var models = require('../models');
var ZoneSet = models.ZoneSet;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewZoneSet(zoneSetInfo,done) {
    ZoneSet.sync()
        .then(
            function () {
                delete zoneSetInfo.idZoneSet;
                var zoneSet = ZoneSet.build(zoneSetInfo);
                zoneSet.save()
                    .then(function (zoneSet) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ZoneSet success", {idZoneSet: zoneSet.idZoneSet, orderNum: zoneSet.orderNum}));
                    })
                    .catch(function (err) {
			console.log(err);
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new ZoneSet "+err.name));
                    })
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )
}
function editZoneSet(zoneSetInfo, done) {
    ZoneSet.findById(zoneSetInfo.idZoneSet)
        .then(function (zoneSet) {
            zoneSet = Object.assign(zoneSet, zoneSetInfo);
            zoneSet.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit zoneSet success", zoneSetInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit zoneSet" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for edit"))
        });
}
function deleteZoneSet(zoneSetInfo, done) {
    ZoneSet.findById(zoneSetInfo.idZoneSet)
        .then(function (zoneSet) {
            zoneSet.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "ZoneSet is deleted", zoneSet));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete ZoneSet "+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for delete"));
        })
}
function getZoneSetInfo(zoneSet,done) {
    ZoneSet.findById(zoneSet.idZoneSet, {include: [{all: true}]})
        .then(function (zoneSet) {
            if (!zoneSet) throw "not exits";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info ZoneSet success", zoneSet));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for get info"));
        })
}

function getZoneSetList(setInfo,done) {
    ZoneSet.findAll({where:{idWell:setInfo.idWell}})
        .then(function (zoneSetList) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get list zoneset success", zoneSetList));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "get zone-set list error"));
        })
}

module.exports = {
    createNewZoneSet:createNewZoneSet,
    deleteZoneSet:deleteZoneSet,
    editZoneSet:editZoneSet,
    getZoneSetInfo:getZoneSetInfo,
    getZoneSetList:getZoneSetList
};

