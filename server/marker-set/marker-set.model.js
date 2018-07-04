const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const async = require('async');

function createNew(payload, done, dbConnection) {
    if (payload.template) {
        dbConnection.MarkerSet.create(payload).then(markerSet => {
            let Op = require('sequelize').Op;
            dbConnection.MarkerTemplate.findAll({where: {template: payload.template}}).then(async templates => {
                let well = await dbConnection.Well.findById(markerSet.idWell, {
                    include: {
                        model: dbConnection.WellHeader,
                        where: {header: {[Op.or]: [{[Op.like]: 'STRT'}, {[Op.like]: 'STOP'}, {[Op.like]: 'STEP'}]}}
                    }
                });
                let stop = parseFloat((well.well_headers.find(s => s.header === 'STOP')).value);
                let start = parseFloat((well.well_headers.find(s => s.header === 'STRT')).value);
                let range = (stop - start) / templates.length;
                async.eachSeries(templates, function (tp, next) {
                    dbConnection.Marker.create({
                        depth: start,
                        idMarkerTemplate: tp.idMarkerTemplate,
                        idMarkerSet: markerSet.idMarkerSet,
                        updatedBy: payload.updatedBy,
                        createdBy: payload.createdBy
                    }).then(() => {
                        start = start + range;
                        next();
                    }).catch(err => {
                        console.log(err);
                        next();
                    });
                }, function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", markerSet));
                })
            });
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
        })
    } else {
        dbConnection.MarkerSet.create(payload).then(m => {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Done", m));
        }).catch(err => {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
        });
    }
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
    dbConnection.MarkerSet.findById(payload.idMarkerSet, {include: {model: dbConnection.Marker}}).then(r => {
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
