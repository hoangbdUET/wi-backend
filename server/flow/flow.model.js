let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

let createNewFlow = function (flow, done, dbConnection) {
    dbConnection.Flow.create(flow).then(f => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", f));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
    });
};

let editFlow = function (flowInfo, done, dbConnection) {
    dbConnection.Flow.findById(flowInfo.idFlow).then(flow => {
        if (flow) {
            Object.assign(flow, flowInfo).save().then(f => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", f));
            }).catch(err => {
                done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No flow found by if"));
        }
    });
};

let infoFlow = function (flow, done, dbConnection) {
    dbConnection.Flow.findById(flow.idFlow, {include: {all: true}}).then(f => {
        if (f) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", f));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No flow found by if"));
        }
    });
};

let listFlow = function (flow, done, dbConnection) {
    dbConnection.Flow.findAll({where: {idProject: flow.idProject}}).then(fs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", fs));
    });
};

let deleteFlow = function (flow, done, dbConnection) {
    dbConnection.Flow.findById(flow.idFlow, {include: {all: true}}).then(f => {
        if (f) {
            f.destroy().then(fl => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", f));
            })
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No flow found by if"));
        }
    });
};

module.exports = {
    createNewFlow: createNewFlow,
    infoFlow: infoFlow,
    deleteFlow: deleteFlow,
    listFlow: listFlow,
    editFlow: editFlow
}