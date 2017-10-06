var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewTernary(ternaryInfo, done, dbConnection) {
    var Ternary = dbConnection.Ternary;
    Ternary.sync()
        .then(function () {
            delete ternaryInfo.idTernary;
            Ternary.build(ternaryInfo)
                .save()
                .then(function (ternary) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ternary success", ternary));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new ternary error" + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })
}

function editTernary(ternaryInfo, done, dbConnection) {
    var Ternary = dbConnection.Ternary;
    Ternary.findById(ternaryInfo.idTernary)
        .then(function (ternary) {
            delete ternaryInfo.idTernary;
            delete ternaryInfo.idCrossPlot;
            Object.assign(ternary, ternaryInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Ternary success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Ternary err" + err));

                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Ternary not found for edit"));
        })
}

function deleteTernary(ternaryInfo, done, dbConnection) {
    var Ternary = dbConnection.Ternary;
    Ternary.findById(ternaryInfo.idTernary)
        .then(function (ternary) {
            ternary.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Ternary is deleted", ternary));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Ternary" + err.errors[0].message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Ternary not found for delete"));
        });
}

function inforTernary(ternaryInfo, done, dbConnection) {
    var Ternary = dbConnection.Ternary;
    Ternary.findById(ternaryInfo.idTernary).then(ternary => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "SUcCeSsfuLL !", ternary));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
    })
}

function listTernaryByCrossPlot(ternaryInfo, done, dbConnection) {
    var Ternary = dbConnection.Ternary;
    Ternary.findAll({
        where: {
            idCrossPlot: ternaryInfo.idCrossPlot
        }
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Ternary list", rs));
    }).catch(err => {
        console.log(err);
    });
}

module.exports = {
    createNewTernary: createNewTernary,
    editTernary: editTernary,
    deleteTernary: deleteTernary,
    inforTernary: inforTernary,
    listTernaryByCrossPlot: listTernaryByCrossPlot
}