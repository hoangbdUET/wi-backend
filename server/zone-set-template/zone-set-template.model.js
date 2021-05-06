let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewZoneSetTemplate(payload, done, dbConnection) {
    if (!payload.idProject) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need idProject", "Need idProject"));
    dbConnection.ZoneSetTemplate.create(payload).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            dbConnection.ZoneSetTemplate.findOne({
                where: {
                    idProject: payload.idProject,
                    name: payload.name
                }
            }).then(z => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Zone set template's name already exists!", z));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    });
}

function infoZoneSetTemplate(payload, done, dbConnection) {
    dbConnection.ZoneSetTemplate.findByPk(payload.idZoneSetTemplate, { include: [{ model: dbConnection.ZoneTemplate }, { model: dbConnection.ZoneSet }] }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}

function listZoneSetTemplate(payload, done, dbConnection) {
    dbConnection.ZoneSetTemplate.findAll({
        include: [{ model: dbConnection.ZoneTemplate }, { model: dbConnection.ZoneSet }],
        where: { idProject: payload.idProject ? payload.idProject : null }
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}


function deleteZoneSetTemplate(payload, done, dbConnection) {
    delete payload.createdBy;
    dbConnection.ZoneSetTemplate.findByPk(payload.idZoneSetTemplate).then(zst => {
        if (zst) {
            zst.setDataValue('updatedBy', payload.updatedBy);
            zst.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", zst));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No zone set template found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function editZoneSetTemplate(payload, done, dbConnection) {
    delete payload.createdBy;
    dbConnection.ZoneSetTemplate.findByPk(payload.idZoneSetTemplate).then(zst => {
        if (zst) {
            Object.assign(zst, payload).save().then((zst_) => {
                dbConnection.ZoneSetTemplate.findByPk(zst_.idZoneSetTemplate, { include: { model: dbConnection.ZoneSet } }).then((r) => {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
                });
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No zone set template found"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

module.exports = {
    createNewZoneSetTemplate,
    infoZoneSetTemplate,
    deleteZoneSetTemplate,
    editZoneSetTemplate,
    listZoneSetTemplate
};

