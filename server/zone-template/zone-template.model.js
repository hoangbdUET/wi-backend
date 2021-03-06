let Model = require('../models-master/index').ZoneTemplate;
let ZoneSetTemplateModel = require('../models-master').ZoneSetTemplate;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createZoneTemplateFromXLSX(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Zone_Template.xlsx'), 'zone_template').splice(1);
    async.each(rows, function (row, next) {
        if (row[0] !== '' || row[1] !== '') {
            Model.create({
                idZoneTemplate: row[0],
                idZoneSetTemplate: row[1],
                name: row[2],
                background: row[3],
                foreground: row[4],
                pattern: row[5],
                orderNum: row[6],
                exportValue: row[7]
            }).then(() => {
                next();
            }).catch((e) => {
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

function createZoneSetTemplateFromXLSX(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Zone_Template.xlsx'), 'zone_set_template').splice(1);
    async.each(rows, function (row, next) {
        if (row[0] !== '' || row[1] !== '') {
            ZoneSetTemplateModel.create({
                idZoneSetTemplate: row[0],
                name: row[1]
            }).then(() => {
                next();
            }).catch((err) => {
                next();
            });

        } else {
            next();
        }
    }, function () {
        console.log("Done all zone-set-template");
        callback();
    });
}

function newZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.create(payload).then(rs => {
        // if(rs)
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            dbConnection.ZoneTemplate.findOne({
                where: {
                    idZoneSetTemplate: payload.idZoneSetTemplate,
                    name: payload.name
                }
            }).then(z => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Zone template's name already exists!", z));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    })
}

function editZoneTemplate(payload, done, dbConnection) {
    delete payload.createdBy;
    dbConnection.ZoneTemplate.findByPk(payload.idZoneTemplate).then(zt => {
        if (zt) {
            Object.assign(zt, payload).save().then(zt => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", zt));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No zone template found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function deleteZoneTemplate(payload, done, dbConnection) {
    delete payload.createdBy;
    dbConnection.ZoneTemplate.findByPk(payload.idZoneTemplate).then(zt => {
        if (zt) {
            zt.setDataValue("updatedBy", payload.updatedBy);
            zt.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", zt));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No zone template found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function listZoneTemplate(payload, done, dbConnection) {
    dbConnection.ZoneTemplate.findAll({ where: { idZoneSetTemplate: payload.idZoneSetTemplate } }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    });
}

module.exports = {
    createZoneSetTemplateFromXLSX,
    createZoneTemplateFromXLSX,
    newZoneTemplate,
    editZoneTemplate,
    deleteZoneTemplate,
    listZoneTemplate
};
