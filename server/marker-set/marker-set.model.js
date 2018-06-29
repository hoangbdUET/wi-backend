const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;


function createNew(payload, done, dbConnection) {
    dbConnection.MarkerSet.create(payload).then(m => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", m));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    })
}

function edit(payload, done, dbConnection) {
    dbConnection.MarkerSet.findById(payload.idMarkerSet).then(m => {
        if (m) {
            Object.assign(m, payload).save().then(r => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No marker found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function del(payload, done, dbConnection) {
    dbConnection.MarkerSet.destroy({where: {idMarkerSet: payload.idMarkerSet}}).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function list(payload, done, dbConnection) {
    dbConnection.MarkerSet.findAll({where: {idWell: payload.idWell}}).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

function info(payload, done, dbConnection) {
    dbConnection.MarkerSet.findById(payload.idMarkerSet).then(r => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
    });
}

module.exports = {
    createNewMarkerSet: createNew,
    editMarkerSet: edit,
    deleteMarkerSet: del,
    listMarkerSet: list,
    infoMarkerSet: info
};
