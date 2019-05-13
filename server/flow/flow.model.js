let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');
let validationFlow = require('../project/project.model').validationFlow;

let createNewFlow = function (flow, done, dbConnection) {
	if (flow.idFlow) {
		dbConnection.Flow.findByPk(flow.idFlow, {include: {model: dbConnection.Task}}).then(fl => {
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
	} else if (flow.idParameterSet) {
		dbConnection.ParameterSet.findByPk(flow.idParameterSet).then(pt => {
			if (!pt) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No template found"));
			dbConnection.Flow.create({
				name: flow.name,
				content: pt.content.content,
				createdBy: flow.createdBy,
				updatedBy: flow.updatedBy,
				idProject: flow.idProject
			}).then(fl => {
				async.each(pt.content.tasks, (task, next) => {
					dbConnection.Task.create({
						name: task.name,
						content: task.content,
						createdBy: flow.createdBy,
						updatedBy: flow.updatedBy,
						idFlow: fl.idFlow,
						idTaskSpec: task.idTaskSpec
					}).then(t => {
						next();
					}).catch(err => {
						console.log(err);
						next();
					})
				}, () => {
					const validateFlow = require('../project/project.model').validationFlow;
					validateFlow(fl.idFlow, dbConnection).then(() => {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Done", fl));
					});
				});
			}).catch(err => {
				if (err.name === "SequelizeUniqueConstraintError") {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Flow's name already exists!"));
				} else {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
				}
			});
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
	dbConnection.Flow.findByPk(flowInfo.idFlow).then(flow => {
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
	dbConnection.Flow.findByPk(flow.idFlow, {include: {all: true}}).then(f => {
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
			dbConnection.ParameterSet.findAll({where: {idProject: flow.idProject, type: "FT"}}).then(fts => {
				rs.push(...fts);
				done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
			});
		})
	} else {
		dbConnection.Flow.findAll({where: {idProject: flow.idProject, isTemplate: false}}).then(fs => {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", fs));
		});
	}
};

let deleteFlow = function (flow, done, dbConnection) {
	dbConnection.Flow.findByPk(flow.idFlow, {include: {all: true}}).then(f => {
		if (f) {
			f.destroy().then(fl => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", f));
			})
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No flow found by if"));
		}
	});
};


let duplicateFlow = function (flow, done, dbConnection) {
	if (!flow.name) {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need flow name"));
	} else {
		dbConnection.Flow.findByPk(flow.idFlow, {include: {model: dbConnection.Task}}).then(fl => {
			if (fl) {
				dbConnection.Flow.create({
					name: flow.name,
					content: fl.content,
					createdBy: flow.createdBy,
					updatedBy: flow.updatedBy,
					idProject: fl.idProject
				}).then(f => {
					async.each(fl.tasks, (task, next) => {
						dbConnection.Task.create({
							name: task.name,
							content: task.content,
							createdBy: flow.createdBy,
							updatedBy: flow.updatedBy,
							idFlow: f.idFlow,
							idTaskSpec: task.idTaskSpec
						}).then(t => {
							console.log("Done task ", t.name, "-", f.name);
							next()
						}).catch(err => {
							console.log(err);
							next();
						});
					}, () => {
						const validateFlow = require('../project/project.model').validationFlow;
						validateFlow(f.idFlow, dbConnection).then(() => {
							done(ResponseJSON(ErrorCodes.SUCCESS, "Done", f));
						});
					});
				}).catch(err => {
					if (err.name === "SequelizeUniqueConstraintError") {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow's name already exists!"));
					} else {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
					}
				});
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No flow found"));
			}
		});
	}
};

let saveAsTemplate = function (flow, done, dbConnection) {
	if (!flow.name) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need template name"));
	dbConnection.Flow.findByPk(flow.idFlow, {include: {model: dbConnection.Task}}).then(fl => {
		fl = fl.toJSON();
		if (fl) {
			let saveObjContent = {
				content: fl.content,
				tasks: fl.tasks.map(t => {
					t.content.inputData = [];
					t.content.paramData = [];
					return t;
				})
			};
			dbConnection.ParameterSet.create({
				name: flow.name,
				idProject: fl.idProject,
				createdBy: flow.createdBy,
				updatedBy: flow.updatedBy,
				content: saveObjContent,
				type: "FT"
			}).then(() => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
			}).catch(err=>{
				if (err.name === "SequelizeUniqueConstraintError") {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Workflow template's name already exists!"));
				} else {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
				}
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No workflow found"));
		}
	});
};

module.exports = {
	createNewFlow: createNewFlow,
	infoFlow: infoFlow,
	deleteFlow: deleteFlow,
	listFlow: listFlow,
	editFlow: editFlow,
	duplicateFlow: duplicateFlow,
	saveAsTemplate: saveAsTemplate
};