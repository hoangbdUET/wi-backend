let Model = require('../models-master/index').ZoneTemplate;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');
let userModel = require('../models/index');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createZoneTemplateFromXLSX(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Zone_Template.xlsx'), 'zone_template').splice(1);
    async.each(rows, function (row, next) {
        Model.create({
            idZoneTemplate: row[0],
            template: row[1],
            name: row[2],
            background: row[3],
            foreground: row[4],
            pattern: row[5]
        }).then(() => {
            next();
        }).catch(() => {
            next();
        });
    }, function () {
        console.log("Done all zone-template");
        callback();
    });
}

function synZoneTemplate(username, callback) {
    let userDbConnection = userModel("wi_" + username, function (err) {
        if (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        }
    });
    userDbConnection.ZoneTemplate.destroy({where: {}}).then(() => {
        Model.findAll().then(gs => {
            async.each(gs, function (g, next) {
                g = g.toJSON();
                userDbConnection.ZoneTemplate.create(g).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next(err);
                });
            }, function (err) {
                if (err) console.log(err);
                callback(null, "DONE ALL ZONE TEMPLATE");
            });
        }).catch(err => {
            console.log(err);
            callback(err, null);
        });
    }).catch(err => {
        callback(err, null);
    });
}

function listZoneTemplate(payload, done, dbConnection) {
    let response = [];
    dbConnection.ZoneTemplate.findAll({group: ['template']}).then(zones => {
        async.each(zones, function (zone, next) {
            response.push({
                idZoneTemplate: zone.idZoneTemplate,
                template: zone.template
            });
            next();
        }, function () {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", response));
        });
    }).catch(err=>{
        console.log(err);
        // done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", response));
    });
}

function allZone(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.findAll().then(zs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", zs));
    });
}

function newZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.create(payload).then(z => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", z));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
    });
}

function editZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.findById(payload.idZoneTemplate).then(z => {
        if (z) {
            Object.assign(z, payload).save().then((g) => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", g));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No template found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
    });
}

function deleteZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.findById(payload.idZoneTemplate).then(z => {
        if (z) {
            z.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", z));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No template found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
    });
}

function importZoneTemplate(payload, done, dbConnection) {

}

function exportZoneTemplate(payload, done, dbConnection) {

}

module.exports = {
    createZoneTemplateFromXLSX: createZoneTemplateFromXLSX,
    synZoneTemplate: synZoneTemplate,
    listZoneTemplate: listZoneTemplate,
    newZoneTemplate: newZoneTemplate,
    importZoneTemplate: importZoneTemplate,
    exportZoneTemplate: exportZoneTemplate,
    allZone: allZone,
    editZoneTemplate: editZoneTemplate,
    deleteZoneTemplate: deleteZoneTemplate
};