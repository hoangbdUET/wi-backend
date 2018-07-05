const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const async = require('async');

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
    if (payload.list_template) {
        dbConnection.MarkerTemplate.findAll().then(mts => {
            let response = [];
            async.each(mts, function (mt, next) {
                let existed = response.find(r => r.template === mt.template);
                if (!existed) {
                    response.push({
                        template: mt.template
                    });
                    next();
                } else {
                    next();
                }
            }, function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", response));
            });
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
        });
    } else {
        dbConnection.MarkerTemplate.findAll().then(r => {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
        });
    }
}

module.exports = {
    createNewMarkerTemplate: createNewMarkerTemplate,
    editMarkerTemplate: editMarkerTemplate,
    deleteMarkerTemplate: deleteMarkerTemplate,
    infoMarkerTemplate: infoMarkerTemplate,
    allMarkerTemplate: allMarkerTemplate
};