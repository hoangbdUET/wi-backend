"use strict";
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
function createNewDiscrim(discrimInfo,done,dbConnection) {
    var Discrim = dbConnection.Discrim;
    Discrim.sync()
        .then(function () {
            delete discrimInfo.idDiscrim;
            Discrim.build(discrimInfo)
                .save()
                .then(function (discrim) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Discrim success", discrim));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Discrim" + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })
}
function editDiscim(discrimInfo, done,dbConnection) {
    var Discrim = dbConnection.Discrim;
    Discrim.findByPk(discrimInfo.idDiscrim)
        .then(function (discrim) {
            delete discrimInfo.idDiscrim;
            delete discrimInfo.idCrossPlot;
            Object.assign(discrim, discrimInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Discrim success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Discrim" + err));

                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Discrim not found for edit"));
        })
}

function deleteDiscrim(discrimInfo, done,dbConnection) {
    var Discrim = dbConnection.Discrim;
    Discrim.findByPk(discrimInfo.idDiscrim)
        .then(function (discrim) {
            discrim.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Discrim is deleted", discrim));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Discim not found for delete"));
        });
}
function getDiscrimInfo(discrimInfo, done,dbConnection) {
    var Discrim = dbConnection.Discrim;
    Discrim.findByPk(discrimInfo.idDiscrim)
        .then(function (discrim) {
            if (!discrim) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get Discrim info success", discrim));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Discrim not found for get info"));
        })
}

function getListDiscrim(req, done) {
    var dbConnection = req.dbConnection;
    var Discrim = dbConnection.Discrim;
    if (req.list == 'histogram') {
        Discrim.findAll({where: {idHistogram: !null}}).then(function (discrims) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get list Discrim of histogram success", discrims));
        }).catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Get list Discrim of histogram failed", err.message));
        });
    } else if (req.list == 'cross-plot') {
        Discrim.findAll({where: {idCrossPlot: !null}}).then(function (discrims) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get list Discrim of cross-plot success", discrims));
        }).catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Get list Discrim of cross-plot failed", err.message));
        });
    } else {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Get list Discrim Failed, Can't read body"));
    }
}

module.exports = {
    createNewDiscrim: createNewDiscrim,
    editDiscim: editDiscim,
    deleteDiscrim: deleteDiscrim,
    getDiscrimInfo: getDiscrimInfo,
    getListDiscrim: getListDiscrim
};