const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;

function createNewMarkerTemplate(payload, done, dbConnection) {
    dbConnection.MarkerTemplate.create(payload).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}

function editMarkerTemplate(payload, done, dbConnection) {
    dbConnection.MarkerTemplate.findById(payload.idMarkerTemplate).then(m => {
        if (m) {
            Object.assign(m, payload).save().then(r => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No marker template found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function deleteMarkerTemplate(payload, done, dbConnection) {
    dbConnection.MarkerTemplate.destroy({where: {idMarkerTemplate: payload.idMarkerTemplate}}).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function infoMarkerTemplate(payload, done, dbConnection) {
    dbConnection.MarkerTemplate.findById(payload.idMarkerTemplate).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}


function allMarkerTemplate(payload, done, dbConnection) {
    dbConnection.MarkerTemplate.findAll({where: {idMarkerSetTemplate: payload.idMarkerSetTemplate}}).then(l => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", l));
    });
}

module.exports = {
    createNewMarkerTemplate: createNewMarkerTemplate,
    editMarkerTemplate: editMarkerTemplate,
    deleteMarkerTemplate: deleteMarkerTemplate,
    infoMarkerTemplate: infoMarkerTemplate,
    allMarkerTemplate: allMarkerTemplate
};