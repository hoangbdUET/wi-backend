let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewZoneSetTemplate(payload, done, dbConnection) {
    if (!payload.idProject) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need idProject", "Need idProject"));
    dbConnection.ZoneSetTemplate.create(payload).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function infoZoneSetTemplate(payload, done, dbConnection) {
    dbConnection.ZoneSetTemplate.findById(payload.idZoneSetTemplate, {include: [{model: dbConnection.ZoneTemplate}, {model: dbConnection.ZoneSet}]}).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}

function listZoneSetTemplate(payload, done, dbConnection) {
    dbConnection.ZoneSetTemplate.findAll({
        include: [{model: dbConnection.ZoneTemplate}, {model: dbConnection.ZoneSet}],
        where: {idProject: payload.idProject ? payload.idProject : null}
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}


function deleteZoneSetTemplate(payload, done, dbConnection) {
    dbConnection.ZoneSetTemplate.findById(payload.idZoneSetTemplate).then(zst => {
        if (zst) {
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
    dbConnection.ZoneSetTemplate.findById(payload.idZoneSetTemplate).then(zst => {
        if (zst) {
            Object.assign(zst, payload).save().then((zst_) => {
                dbConnection.ZoneSetTemplate.findById(zst_.idZoneSetTemplate, {include: {model: dbConnection.ZoneSet}}).then((r) => {
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

