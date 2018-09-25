let Model = require('../models-master/index').ZoneTemplate;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');
let config = require('config');
let userModel = require('../models/index');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createZoneTemplateFromXLSX(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Zone_Template.xlsx'), 'zone_template').splice(1);
    async.each(rows, function (row, next) {
        if (row[0] !== '' || row[1] !== '') {
            Model.create({
                idZoneTemplate: row[0],
                template: row[1],
                name: row[2],
                background: row[3],
                foreground: row[4],
                pattern: row[5],
                orderNum: row[6]
            }).then(() => {
                next();
            }).catch(() => {
                next();
            });

        } else {
            next();
        }
    }, function () {
        console.log("Done all zone-template");
        callback();
    });
}

function synZoneTemplate(username, callback) {
    let userDbConnection = userModel(config.Database.prefix + username, function (err) {
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
    // dbConnection.ZoneTemplate.findAll({group: ['template']}).then(zones => {
    dbConnection.ZoneTemplate.findAll().then(zones => {
        async.each(zones, function (zone, next) {
            let existed = response.find(r => r.template === zone.template);
            if (!existed) {
                response.push({
                    idZoneTemplate: zone.idZoneTemplate,
                    template: zone.template
                });
                next();
            } else {
                next();
            }
        }, function () {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
        });
    }).catch(err => {
        console.log(err);
        // done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
    });
}

function allZone(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.findAll({where: {template: payload.template}}).then(zs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", zs));
    });
}

function newZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.create(payload).then(z => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", z));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
    });
}

function editZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.findById(payload.idZoneTemplate).then(z => {
        if (z) {
            Object.assign(z, payload).save().then((g) => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", g));
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
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", z));
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

function exportZoneTemplate(payload, callback, dbConnection) {
    let dataToXLSX = [];
    dataToXLSX.push(['id', 'zone_template', 'zone_name', 'zone_background', 'zone_foreground', 'zone_pattern', 'order_num']);
    let count = 1;
    async.each(payload.templates, function (template, next) {
        dbConnection.ZoneTemplate.findAll({where: {template: template}}).then(zones => {
            async.each(zones, function (zone, nextZone) {
                dataToXLSX.push([count, zone.template, zone.name, zone.background, zone.foreground, zone.pattern, zone.orderNum]);
                count++;
                nextZone();
            }, function () {
                next();
            });
        });
    }, function () {
        wixlsx.exportDataToXLSX(dataToXLSX, 'zone_template', function (err, file) {
            callback(err, file);
        });
    });
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
