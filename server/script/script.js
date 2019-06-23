const express = require('express');
const router = express.Router();
const async = require('async');
const dbMaster = require('../models-master');
const dataTool = require('../utils/data-tool');
const config = require('config');
const fsExtra = require('fs-extra');
router.post('/migrate/clone-zone-set-template', async (req, res) => {
	let dbConnection = req.dbConnection;
	let projects = await dbConnection.Project.findAll();
	let zoneSetTemplates = await dbConnection.ZoneSetTemplate.findAll({
		include: {model: dbConnection.ZoneTemplate}
	});
	async.each(projects, (project, nextProject) => {
		async.each(zoneSetTemplates, (zoneSetTemplate, nextZst) => {
			dbConnection.ZoneSetTemplate.create({
				name: zoneSetTemplate.name,
				idProject: project.idProject
			}).then(zst => {
				async.each(zoneSetTemplate.zone_templates, (zs, nextZ) => {
					dbConnection.ZoneTemplate.create({
						name: zs.name,
						background: zs.background,
						foreground: zs.foreground,
						pattern: zs.pattern,
						orderNum: zs.orderNum,
						idZoneSetTemplate: zst.idZoneSetTemplate
					}).then(() => {
						nextZ();
					}).catch(err => {
						console.log(err);
						nextZ();
					});
				}, function () {
					nextZst();
				});
			}).catch(err => {
				console.log(err);
				nextZst();
			});
		}, function () {
			nextProject();
		});
	}, function () {
		res.json(zoneSetTemplates);
	});
});

router.post('/migrate/clone-marker-set-template', async (req, res) => {
	let dbConnection = req.dbConnection;
	let projects = await dbConnection.Project.findAll();
	let markerSetTemplates = await dbConnection.MarkerSetTemplate.findAll({
		include: {model: dbConnection.MarkerTemplate}
	});
	async.each(projects, (project, nextProject) => {
		async.each(markerSetTemplates, (markerSetTemplate, nextZst) => {
			dbConnection.MarkerSetTemplate.create({
				name: markerSetTemplate.name,
				idProject: project.idProject
			}).then(zst => {
				async.each(markerSetTemplate.marker_templates, (zs, nextZ) => {
					dbConnection.MarkerTemplate.create({
						name: zs.name,
						color: zs.color,
						lineStyle: zs.lineStyle,
						lineWidth: zs.lineWidth,
						orderNum: zs.orderNum,
						idMarkerSetTemplate: zst.idMarkerSetTemplate
					}).then(() => {
						nextZ();
					}).catch(err => {
						console.log(err);
						nextZ();
					});
				}, function () {
					nextZst();
				});
			}).catch(err => {
				console.log(err);
				nextZst();
			});
		}, function () {
			nextProject();
		});
	}, function () {
		res.json(markerSetTemplates);
	});
});

router.post('/migrate/update-zone-set', async (req, res) => {
	let dbConnection = req.dbConnection;
	let zonesets = await dbConnection.ZoneSet.findAll({
		include: {
			model: dbConnection.Zone,
			include: {model: dbConnection.ZoneTemplate}
		}
	});
	async.each(zonesets, function (zoneset, next) {
		getIdProjectByIdWell(zoneset.idWell, dbConnection).then(idProject => {
			console.log("++++++", idProject);
			dbConnection.ZoneSetTemplate.findByPk(zoneset.idZoneSetTemplate).then(zst => {
				console.log("------", zst.name);
				dbConnection.ZoneSetTemplate.findOne({where: {idProject: idProject, name: zst.name}}).then(_zst => {
					console.log("=======", _zst.idZoneSetTemplate);
					if (_zst.idZoneSetTemplate) {
						zoneset.idZoneSetTemplate = _zst.idZoneSetTemplate;
						zoneset.save().then(() => {
							async.each(zoneset.zones, (zone, nextZ) => {
								dbConnection.ZoneTemplate.findOne({
									where: {
										name: zone.zone_template.name,
										idZoneSetTemplate: _zst.idZoneSetTemplate
									}
								}).then(_zoneTemplate => {
									if (_zoneTemplate && _zoneTemplate.idZoneTemplate) {
										console.log("??????", _zoneTemplate.idZoneTemplate);
										zone.idZoneTemplate = _zoneTemplate.idZoneTemplate;
										zone.save().then(() => {
											nextZ();
										});
									} else {
										nextZ();
									}
								});
							}, function () {
								next();
							});
						});
					} else {
						next();
					}
				});
			});
		});
	}, function () {
		res.json(zonesets);
	});
});

router.post('/migrate/update-marker-set', async (req, res) => {
	let dbConnection = req.dbConnection;
	let markersets = await dbConnection.MarkerSet.findAll({
		include: {
			model: dbConnection.Marker,
			include: {model: dbConnection.MarkerTemplate}
		}
	});
	async.each(markersets, function (markerset, next) {
		getIdProjectByIdWell(markerset.idWell, dbConnection).then(idProject => {
			console.log("++++++", idProject);
			dbConnection.MarkerSetTemplate.findByPk(markerset.idMarkerSetTemplate).then(zst => {
				console.log("------", zst.name);
				dbConnection.MarkerSetTemplate.findOne({where: {idProject: idProject, name: zst.name}}).then(_zst => {
					console.log("=======", _zst.idMarkerSetTemplate);
					if (_zst.idMarkerSetTemplate) {
						markerset.idMarkerSetTemplate = _zst.idMarkerSetTemplate;
						markerset.save().then(() => {
							async.each(markerset.markers, (marker, nextZ) => {
								dbConnection.MarkerTemplate.findOne({
									where: {
										name: marker.marker_template.name,
										idMarkerSetTemplate: _zst.idMarkerSetTemplate
									}
								}).then(_zoneTemplate => {
									if (_zoneTemplate && _zoneTemplate.idMarkerTemplate) {
										console.log("??????", _zoneTemplate.idMarkerTemplate);
										marker.idMarkerTemplate = _zoneTemplate.idMarkerTemplate;
										marker.save().then(() => {
											nextZ();
										});
									} else {
										nextZ();
									}
								});
							}, function () {
								next();
							});
						});
					} else {
						next();
					}
				});
			});
		});
	}, function () {
		res.json(markersets);
	});
});

async function getIdProjectByIdWell(idWell, dbConnection) {
	let well = await dbConnection.Well.findByPk(idWell);
	if (well) return well.idProject;
	return null;
}

router.post('/migrate/task-spec', async (req, res) => {
	const dbConnection = req.dbConnection;
	dbMaster.TaskSpec.findAll().then((master_tps) => {
		async.each(master_tps, (master_tp, next) => {
			dbConnection.TaskSpec.findByPk(master_tp.idTaskSpec).then(ts => {
				if (ts) {
					ts.content = master_tp.content;
					ts.name = master_tp.name;
					ts.type = master_tp.type;
					ts.group = master_tp.group;
					ts.save().then(() => {
						next();
					});
				} else {
					console.log("Loi ", master_tp.idTaskSpec);
					next();
				}
			});
		}, function () {
			res.json(req.decoded.username + " Done");
		});
	});
});

router.post('/migrate/add-flow-default', async (req, res) => {
	const dbConnection = req.dbConnection;
	async.series([
		(cb) => {
			dbMaster.Flow.findAll().then(flows => {
				async.each(flows, (flow, next) => {
					flow = flow.toJSON();
					console.log("Create flow ", flow.name);
					flow.createdBy = req.createdBy;
					flow.updatedBy = req.createdBy;
					dbConnection.Flow.create(flow).then(next).catch((err) => {
						console.log("error flow");
						next();
					});
				}, () => {
					cb();
				});
			});
		},
		(cb) => {
			dbMaster.Task.findAll().then(tasks => {
				async.each(tasks, (task, next) => {
					task = task.toJSON();
					console.log("Create task ", task.name);
					task.createdBy = req.createdBy;
					task.updatedBy = req.createdBy;
					dbConnection.Task.create(task).then(next).catch((err) => {
						console.log("Error task");
						next();
					});
				}, () => {
					cb();
				});
			});
		}
	], () => {
		res.json(req.decoded.username + " Done");
	})
});

router.post('/migrate/add-flow-to-existed-project', (req, res) => {
	const dbConnection = req.dbConnection;
	dbConnection.Project.findAll().then(projects => {
		async.each(projects, (project, next) => {
			dbConnection.Flow.findAll({where: {idProject: null}, include: {model: dbConnection.Task}}).then(flows => {
				async.each(flows, (flow, nextFlow) => {
					dbConnection.Flow.create({
						name: flow.name,
						content: flow.content,
						description: flow.description,
						createdBy: flow.createdBy,
						updatedBy: flow.updatedBy,
						idProject: project.idProject,
						isTemplate: true
					}).then(fl => {
						async.each(flow.tasks, (task, nextTask) => {
							dbConnection.Task.create({
								name: task.name,
								content: task.content,
								description: task.description,
								createdBy: task.createdBy,
								updatedBy: task.updatedBy,
								idFlow: fl.idFlow,
								idTaskSpec: task.idTaskSpec
							}).then(nextTask).catch(err => {
								console.log(err);
								nextTask();
							});
						}, () => {
							let validationFlow = require('../project/project.model').validationFlow;
							validationFlow(fl.idFlow, dbConnection).then(nextFlow);
						});
					}).catch(err => {
						console.log(err);
						nextFlow();
					});
				}, () => {
					next()
				});
			});
		}, () => {
			res.json(req.decoded.username + " Done");
		});
	});
});

router.post('/migrate/add-ps-to-existed-project', (req, res) => {
	const dbConnection = req.dbConnection;
	dbMaster.ParameterSet.findAll().then(pss => {
		dbConnection.Project.findAll().then(projects => {
			async.each(projects, (project, nextProject) => {
				async.each(pss, (ps, nextParam) => {
					dbConnection.ParameterSet.create({
						name: ps.name,
						content: ps.content,
						note: ps.note,
						type: ps.type,
						createdBy: req.decoded.username,
						updatedBy: req.decoded.username,
						idProject: project.idProject
					}).then(() => {
						nextParam();
					}).catch(() => {
						nextParam();
					});
				}, () => {
					nextProject();
				});
			}, () => {
				res.json(req.decoded.username + " Done");
			});
		});
	});
});

router.post('/migrate/add-zone-template-to-existed-project', (req, res) => {
	const dbConnection = req.dbConnection;
	dbConnection.ZoneTemplate.findAll({where: {idZoneSetTemplate: 1000}}).then(zts => {
		dbConnection.Project.findAll().then(projects => {
			async.eachSeries(projects, (project, next) => {
				dbConnection.ZoneSetTemplate.create({
					idProject: project.idProject,
					name: "Depofacies",
				}).then(zoneSetTemplate => {
					async.eachSeries(zts, (zt, nextZt) => {
						dbConnection.ZoneTemplate.create({
							idZoneSetTemplate: zoneSetTemplate.idZoneSetTemplate,
							name: zt.name,
							background: zt.background,
							foreground: zt.foreground,
							pattern: zt.pattern,
							orderNum: zt.orderNum,
							exportValue: zt.exportValue
						}).then(() => {
							nextZt();
						}).catch(err => {
							console.log(err.message);
							nextZt();
						});
					}, () => {
						next();
					});
				}).catch(() => {
					next();
				});
			}, () => {
				res.json(req.decoded.username + " Done");
			});
		})

	});
});

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

router.post("/update-curve-data", (req, res) => {
	const dbConnection = req.dbConnection;
	let username = req.decoded.username;
	dbConnection.Project.findOne({
		where: {name: "B9_HARMONIZE"},
		include: {model: dbConnection.Well, include: {model: dbConnection.Dataset}}
	}).then(async project => {
		let countSucc = 0;
		let countErr = 0;
		if (project) {
			async.eachSeries(project.wells, (well, nextWell) => {
				async.eachSeries(well.datasets, (dataset, nextDataset) => {
					dbConnection.Curve.findAll({where: {idDataset: dataset.idDataset}}).then(curves => {
						async.eachSeries(curves, (curve, nextCurve) => {
							let curvePath = dataTool.hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
							let martinPath = dataTool.hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, "ess_martin" + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
							console.log(martinPath, curvePath);
							fsExtra.copy(martinPath, curvePath).then(() => {
								sleep(500).then(() => {
									countSucc++;
									console.log("Done");
									nextCurve();
								});
							}).catch(err => {
								sleep(500).then(() => {
									countErr++;
									console.log("Error :", err);
									nextCurve();
								});
							});
						}, () => {
							nextDataset();
						})
					});
				}, () => {
					nextWell();
				});
			}, () => {
				console.log("Done all ", countSucc + countErr, " curves. ", countSucc, " curves success. ", countErr, " curves error.");
				res.json("Done");
			});
		} else {
			res.json("Project not found");
		}
	})
});

module.exports = router;