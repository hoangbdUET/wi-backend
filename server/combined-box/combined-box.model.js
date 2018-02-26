"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewCombinedBox(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBox;
    let idPlots = payload.idLogPlots || [];
    let idCrossplots = payload.idCrossPlots || [];
    let idHistograms = payload.idHistograms || [];
    Model.create(payload).then(async rs => {
        await rs.setPlots(idPlots);
        await rs.setCrossplots(idCrossplots);
        await rs.setHistograms(idHistograms);
        await done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Combined box existed!"));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    });
}

function infoCombinedBox(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBox;
    Model.findById(payload.idCombinedBox, {
        include: [{
            model: dbConnection.Plot
        }, {
            model: dbConnection.CrossPlot
        }, {
            model: dbConnection.Histogram
        }, {
            model: dbConnection.SelectionTool
        }, {
            model: dbConnection.CombinedBoxTool
        }]
    }).then(rs => {
        if (rs) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No row found by id"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });

}

function deleteCombinedBox(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBox;
    Model.findById(payload.idCombinedBox).then(rs => {
        if (rs) {
            rs.destroy().then(rs => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No row found for delete"));
        }
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
    });
}


function editCombinedBox(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBox;
    let idPlots = payload.idLogPlots || [];
    let idCrossplots = payload.idCrossPlots || [];
    let idHistograms = payload.idHistograms || [];
    Model.findById(payload.idCombinedBox).then(rs => {
        if (rs) {
            let newCb = rs.toJSON();
            newCb.name = payload.name || newCb.name;
            newCb.color = payload.color || newCb.color;
            Object.assign(rs, newCb);
            rs.save().then(async () => {
                await rs.setPlots(idPlots);
                await rs.setCrossplots(idCrossplots);
                await rs.setHistograms(idHistograms);
                await done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", newCb));
            }).catch(err => {
                console.log(err);
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
            });
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No row found for edit"));
        }
    }).catch(err => {
        console.log(err);
        if (err.name === "SequelizeUniqueConstraintError") {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Combined box existed!"));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    });
}

module.exports = {
    createNewCombinedBox: createNewCombinedBox,
    infoCombinedBox: infoCombinedBox,
    deleteCombinedBox: deleteCombinedBox,
    editCombinedBox: editCombinedBox
}