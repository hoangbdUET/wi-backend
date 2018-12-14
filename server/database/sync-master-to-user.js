let modelMaster = require('../models-master');
let async = require('async');

let syncFamily = function (userDbConnection, callback) {
	userDbConnection.Family.destroy({where: {}}).then(() => {
		modelMaster.Family.findAll().then(families => {
			async.each(families, function (family, next) {
				userDbConnection.Family.create(family.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next();
				})
			}, function () {
				callback();
			});
		});
	});
};
let syncFamilySpec = function (userDbConnection, callback) {
	userDbConnection.FamilySpec.destroy({where: {}}).then(() => {
		modelMaster.FamilySpec.findAll().then(familie_specs => {
			async.each(familie_specs, function (family_spec, next) {
				userDbConnection.FamilySpec.create(family_spec.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next();
				})
			}, function () {
				callback();
			});
		});
	});
};
let syncFamilyCondition = function (userDbConnection, callback) {
	userDbConnection.FamilyCondition.destroy({where: {}}).then(() => {
		modelMaster.FamilyCondition.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.FamilyCondition.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next();
				})
			}, function () {
				callback();
			});
		});
	});
};
let syncUnitGroup = function (userDbConnection, callback) {
	userDbConnection.UnitGroup.destroy({where: {}}).then(() => {
		modelMaster.UnitGroup.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.UnitGroup.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next();
				})
			}, function () {
				callback();
			});
		});
	});
};
let syncFamilyUnit = function (userDbConnection, callback) {
	userDbConnection.FamilyUnit.destroy({where: {}}).then(() => {
		modelMaster.FamilyUnit.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.FamilyUnit.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next();
				})
			}, function () {
				callback();
			});
		});
	});
};
let syncOverlayLine = function (userDbConnection, callback) {
	userDbConnection.OverlayLine.destroy({where: {}}).then(() => {
		modelMaster.OverlayLine.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.OverlayLine.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};
let syncTaskSpec = function (userDbConnection, callback) {
	userDbConnection.TaskSpec.destroy({where: {}}).then(() => {
		modelMaster.TaskSpec.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.TaskSpec.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};
let syncWorkflowSpec = function (userDbConnection, callback) {
	userDbConnection.WorkflowSpec.destroy({where: {}}).then(() => {
		modelMaster.WorkflowSpec.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.WorkflowSpec.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

let syncZoneSetTemplate = function (userDbConnection, callback) {
	userDbConnection.ZoneSetTemplate.destroy({where: {}}).then(() => {
		modelMaster.ZoneSetTemplate.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.ZoneSetTemplate.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

let syncZoneTemplate = function (userDbConnection, callback) {
	userDbConnection.ZoneTemplate.destroy({where: {}}).then(() => {
		modelMaster.ZoneTemplate.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.ZoneTemplate.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

let syncMarkerTemplate = function (userDbConnection, callback) {
	userDbConnection.MarkerTemplate.destroy({where: {}}).then(() => {
		modelMaster.MarkerTemplate.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.MarkerTemplate.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

let syncMarkerSetTemplate = function (userDbConnection, callback) {
	userDbConnection.MarkerSetTemplate.destroy({where: {}}).then(() => {
		modelMaster.MarkerSetTemplate.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				userDbConnection.MarkerSetTemplate.create(rs.toJSON()).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

let syncFlowTemplate = function (userDbConnection, callback, username) {
	userDbConnection.Flow.destroy({where: {}}).then(() => {
		modelMaster.Flow.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				rs = rs.toJSON();
				rs.createdBy = username;
				rs.updatedBy = username;
				userDbConnection.Flow.create(rs).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

let syncTaskTemplate = function (userDbConnection, callback, username) {
	userDbConnection.Task.destroy({where: {}}).then(() => {
		modelMaster.Task.findAll().then(rss => {
			async.each(rss, function (rs, next) {
				rs = rs.toJSON();
				rs.createdBy = username;
				rs.updatedBy = username;
				userDbConnection.Task.create(rs).then(() => {
					next();
				}).catch(err => {
					console.log(err);
					next(err);
				})
			}, function (err) {
				if (err) return callback(err);
				callback();
			});
		});
	});
};

module.exports = function (input, callback, resetObject) {
	let userDbConnection = input.userDbConnection;
	if (resetObject) {
		switch (resetObject) {
			case 'zone_template': {
				syncZoneTemplate(userDbConnection, callback);
				break;
			}
			case 'marker_template': {
				syncMarkerTemplate(userDbConnection, callback);
				break;
			}
			case 'overlay_line': {
				syncOverlayLine(userDbConnection, callback);
				break;
			}
			case 'workflow_spec': {
				syncWorkflowSpec(userDbConnection, callback);
				break;
			}
			case 'task_spec': {
				syncTaskSpec(userDbConnection, callback);
				break;
			}
			case 'all': {
				async.series([
					function (cb) {
						syncZoneTemplate(userDbConnection, cb);
					},
					function (cb) {
						syncMarkerTemplate(userDbConnection, cb)
					},
					function (cb) {
						syncTaskSpec(userDbConnection, cb);
					},
					function (cb) {
						syncWorkflowSpec(userDbConnection, cb);
					},
					function (cb) {
						syncOverlayLine(userDbConnection, cb);
					}
				], function (results) {
					console.log(results);
					callback();
				});
				break;
			}
			default :
				callback("Wrong type of reset object");
		}
	} else {
		syncFamily(userDbConnection, function () {
			console.log("Done family");
			syncUnitGroup(userDbConnection, function () {
				console.log("Done family unit group");
				syncFamilySpec(userDbConnection, function () {
					console.log("Done family spec");
				});
				syncFamilyCondition(userDbConnection, function () {
					console.log("Done family condition");
				});
				syncOverlayLine(userDbConnection, function () {
					console.log("Done overlay line");
				});
				syncFamilyUnit(userDbConnection, function () {
					console.log("Done family unit");
				});
				syncTaskSpec(userDbConnection, function () {
					console.log("Done task spec");
				});
				syncWorkflowSpec(userDbConnection, function () {
					console.log("Done workflow spec");
				});
				syncZoneSetTemplate(userDbConnection, function () {
					console.log("Done all zone set template");
					syncZoneTemplate(userDbConnection, function () {
						console.log("Done zone template");
					});
				});
				syncMarkerSetTemplate(userDbConnection, function () {
					console.log("Done all marker set template");
					syncMarkerTemplate(userDbConnection, function () {
						console.log("Done marker template");
					});
				});
				syncFlowTemplate(userDbConnection, () => {
					console.log("Done all flow");
					syncTaskTemplate(userDbConnection, () => {
						console.log("Done all task");
					}, input.username);
				}, input.username);
				callback();
			});
		});
	}
};