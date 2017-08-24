var models = require('../models');
var Discrim=models.Discrim;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewDiscrim(discrimInfo,done) {
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
        },function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })
}
function editDiscim(discrimInfo, done) {
    Discrim.findById(discrimInfo.idDiscrim)
        .then(function (discrim) {
            delete discrimInfo.idDiscrim;
            delete discrimInfo.idCrossPlot;
            Object.assign(discrim,discrimInfo)
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

function deleteDiscrim(discrimInfo, done) {
    Discrim.findById(discrimInfo.idDiscrim)
        .then(function (discrim) {
            discrim.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Discrim is deleted", discrim));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Discrim" + err.errors[0].message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Discim not found for delete"));
        });
}
fu
function getDiscrimInfo(discrimInfo, done) {
    Discrim.findById(discrimInfo.idDiscrim)
        .then(function (discrim) {
            if (!discrim) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get Discrim info success", discrim));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Discrim not found for get info"));
        })
}

module.exports = {
    createNewDiscrim: createNewDiscrim,
    editDiscim: editDiscim,
    deleteDiscrim: deleteDiscrim,
    getDiscrimInfo: getDiscrimInfo
};