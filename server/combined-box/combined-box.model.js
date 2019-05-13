"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let selectionModel = require('../selection-tool/selection-tool.model');
let async = require('async');

function createNewCombinedBox(payload, done, dbConnection) {
    let Model = dbConnection.CombinedBox;
    let idPlots = payload.idLogPlots || [];
    let idCrossplots = payload.idCrossPlots || [];
    let idHistograms = payload.idHistograms || [];
    Model.create(payload).then(async rs => {
        await rs.setPlots(idPlots);
        await rs.setCross_plots(idCrossplots);
        await rs.setHistograms(idHistograms);
        await done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Combined plot's name already exists"));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
        }
    });
}

function infoCombinedBox(payload, done, dbConnection, username) {
    let Model = dbConnection.CombinedBox;
    Model.findByPk(payload.idCombinedBox, {
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
            rs = rs.toJSON();
            async.each(rs.selection_tools, function (selectionTool, next) {
                selectionModel.infoSelectionTool(selectionTool, function (status) {
                    selectionTool.data = status.content.data;
                    next();
                }, dbConnection, username);
            }, function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            });
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
    Model.findByPk(payload.idCombinedBox).then(rs => {
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
    delete payload.createdBy;
    let Model = dbConnection.CombinedBox;
    let idPlots = payload.idLogPlots || [];
    let idCrossplots = payload.idCrossPlots || [];
    let idHistograms = payload.idHistograms || [];
    Model.findByPk(payload.idCombinedBox).then(rs => {
        if (rs) {
            let newCb = rs.toJSON();
            newCb.name = payload.name || newCb.name;
            newCb.color = payload.color || newCb.color;
            Object.assign(rs, newCb);
            rs.save().then(async () => {
                await rs.setPlots(idPlots);
                await rs.setCross_plots(idCrossplots);
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
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Combined box's name already exists"));
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
};