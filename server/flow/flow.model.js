let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');
let validationFlow = require('../project/project.model').validationFlow;

let createNewFlow = function (flow, done, dbConnection) {
	if (flow.idFlow) {
		dbConnection.Flow.findById(flow.idFlow, {include: {model: dbConnection.Task}}).then(fl => {
			dbConnection.Flow.create({
				name: flow.name,
				content: fl.content,
				isTemplate: false,
				createdBy: flow.createdBy,
				updatedBy: flow.updatedBy,
				idProject: flow.idProject
			}).then(_flow => {
				async.each(fl.tasks, (task, next) => {
					dbConnection.Task.create({
						name: task.name,
						content: task.content,
						createdBy: flow.createdBy,
						updatedBy: flow.updatedBy,
						idFlow: _flow.idFlow,
						idTaskSpec: task.idTaskSpec
					}).then(() => {
						next();
					}).catch(err => {
						console.log(err);
						next();
					})
				}, () => {
					validationFlow(_flow.idFlow, dbConnection).then(() => {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", _flow));
					});
				})
			}).catch(err => {
				console.log(err);
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
			});
		}).catch(err => {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
		});
	} else {
		dbConnection.Flow.create(flow).then(f => {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", f));
		}).catch(err => {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
		});
	}
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
	if (flow.listTemplate) {
		dbConnection.Flow.findAll({where: {idProject: null}}).then(rs => {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
		})
	} else {
		dbConnection.Flow.findAll({where: {idProject: flow.idProject, isTemplate: false}}).then(fs => {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", fs));
		});
	}
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