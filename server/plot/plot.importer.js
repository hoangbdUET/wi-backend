const path = require('path');
const fs = require('fs');
const async = require('async');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let createdBy;
let updatedBy;
let lineModel = require('../line/line.model');

function findCurve(curve, dbConnection, idProject, well, dataset) {
	return new Promise((resolve => {
		if (!curve) return resolve(null);
		if (dataset) {
			dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
				if (!w) return resolve(null);
				dbConnection.Dataset.findOne({where: {name: dataset.name, idWell: w.idWell}}).then(d => {
					if (!d) return resolve(null);
					dbConnection.Curve.findOne({where: {name: curve.curve, idDataset: d.idDataset}}).then(c => {
						if (!c) {
							return resolve(null);
						} else {
							return resolve(c);
						}
					});
				});
			}).catch(err => {
				return resolve(null);
			});
		} else {
			dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
				if (!w) return resolve(null);
				dbConnection.Dataset.findOne({where: {name: curve.dataset, idWell: w.idWell}}).then(d => {
					if (!d) return resolve(null);
					dbConnection.Curve.findOne({where: {name: curve.curve, idDataset: d.idDataset}}).then(c => {
						if (!c) {
							return resolve(null);
						} else {
							return resolve(c);
						}
					});
				});
			}).catch(err => {
				return resolve(null);
			});
		}
	}));
}

function findWell(well, dbConnection, idProject) {
	return new Promise((resolve => {
		if (!well) return resolve(null);
		dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
			if (!w) {
				resolve(null);
			} else {
				resolve(w);
			}
		}).catch(err => {
			resolve(null);
		});
	}));
}

function findImageSet(imageSet, dbConnection, idProject, well) {
	console.log(imageSet, idProject, well.name);
	return new Promise(resolve => {
		if (!imageSet) return resolve(null);
		dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
			if (!w) {
				console.log("No well found")
				resolve(null);
			} else {
				dbConnection.ImageSet.findOne({where: {idWell: w.idWell, name: imageSet.name}}).then(ims => {
					if (!ims) {
						console.log("NO image found")
						resolve(null);
					} else {
						console.log("FOUND NE")
						resolve(ims);
					}
				})
			}
		}).catch(err => {
			console.log(err);
			resolve(null);
		});
	});
}

function findZoneSet(zoneSet, dbConnection, idProject, well) {
	return new Promise((resolve => {
		if (!zoneSet) return resolve(null);
		dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
			if (!w) {
				resolve(null);
			} else {
				dbConnection.ZoneSet.findOne({where: {idWell: w.idWell, name: zoneSet.name}}).then(zs => {
					if (!zs) {
						resolve(null);
					} else {
						resolve(zs);
					}
				});
			}
		}).catch(err => {
			resolve(null);
		})
	}));
}

function findMarkerSet(markerSet, dbConnection, idProject, well) {
	return new Promise((resolve => {
		if (!markerSet) return resolve(null);
		dbConnection.Well.findOne({where: {name: well.name, idProject: idProject}}).then(w => {
			if (!w) {
				resolve(null);
			} else {
				dbConnection.MarkerSet.findOne({where: {idWell: w.idWell, name: markerSet.name}}).then(zs => {
					if (!zs) {
						resolve(null);
					} else {
						resolve(zs);
					}
				});
			}
		}).catch(err => {
			resolve(null);
		})
	}));
}

function findLine(line, dbConnection, idTrack) {
	return new Promise((resolve => {
		if (!line) return resolve(null);
		dbConnection.Line.findOne({where: {alias: line.alias, idTrack: idTrack}}).then(l => {
			if (!l) {
				resolve(null);
			} else {
				resolve(l);
			}
		})
	}));
}

async function createPlot(plot, dbConnection, idProject, well, dataset) {
	delete plot.cropDisplay;
	plot.createdBy = createdBy;
	plot.updatedBy = updatedBy;
	plot.idProject = idProject;
	let curve = await findCurve(plot.reference_curve, dbConnection, idProject, well, dataset);
	if (curve) plot.referenceCurve = curve.idCurve;
	return await dbConnection.Plot.create(plot);
}

async function createDepthAxis(depth_axis, dbConnection, idProject, idPlot, well, dataset) {
	depth_axis.idPlot = idPlot;
	depth_axis.createdBy = createdBy;
	depth_axis.updatedBy = updatedBy;
	// depth_axis.unitType = well.unit;
	// let well = await findWell(depth_axis.well, dbConnection, idProject);
	let curve = await findCurve(depth_axis.curve, dbConnection, idProject, well, dataset);
	depth_axis.idWell = well ? well.idWell : null;
	depth_axis.idCurve = curve ? curve.idCurve : null;
	return await dbConnection.DepthAxis.create(depth_axis);
}

async function createZoneTrack(zone_track, dbConnection, idProject, idPlot, well) {
	zone_track.idPlot = idPlot;
	zone_track.createdBy = createdBy;
	zone_track.updatedBy = updatedBy;
	let zone_set = await findZoneSet(zone_track.zone_set, dbConnection, idProject, well);
	zone_track.idZoneSet = zone_set ? zone_set.idZoneSet : null;
	return await dbConnection.ZoneTrack.create(zone_track);
}

async function createImageTrack(image_track, dbConnection, idProject, idPlot, well) {
	image_track.idPlot = idPlot;
	image_track.createdBy = createdBy;
	image_track.updatedBy = updatedBy;
	let image_set = await findImageSet(image_track.image_set, dbConnection, idProject, well);
	image_track.idImageSet = image_set ? image_set.idImageSet : null;
	return await dbConnection.ImageTrack.create(image_track);
}

function createTrack(track, dbConnection, idProject, idPlot, username, well, dataset, reversedMappingOptions) {
	return new Promise(async resolve => {
		track.idPlot = idPlot;
		track.createdBy = createdBy;
		track.updatedBy = updatedBy;
		let zone_set = await findZoneSet(track.zone_set, dbConnection, idProject, well);
		let marker_set = await findMarkerSet(track.marker_set, dbConnection, idProject, well);
		track.idZoneSet = zone_set ? zone_set.idZoneSet : null;
		track.idMarkerSet = marker_set ? marker_set.idMarkerSet : null;
		dbConnection.Track.create(track).then(_track => {
			async.waterfall([
				function (cb) {
					async.eachSeries(track.annotations, (annotation, next) => {
						annotation.idTrack = _track.idTrack;
						annotation.createdBy = createdBy;
						annotation.updatedBy = updatedBy;
						dbConnection.Annotation.create(annotation).then(() => {
							next();
						})
					}, cb);
				},
				function (cb) {
					async.eachSeries(track.lines, (line, next) => {
						line.idTrack = _track.idTrack;
						line.createdBy = _track.createdBy;
						line.updatedBy = _track.updatedBy;
						if (line.taskCurve && reversedMappingOptions) {
							line.idCurve = reversedMappingOptions[line.taskCurve];
							dbConnection.Curve.findByPk(line.idCurve, {model: dbConnection.FamilySpec, as: 'family_spec'}).then(c => {
								if (c) {
									line.alias = c.name;
									line.unit = c.unit;
									delete line.idLine;
									lineModel.createNewLine(line, function () {
										next();
									}, dbConnection, username);
								}
							})
						} else {
							findCurve(line.curve, dbConnection, idProject, well, dataset).then(curve => {
								if (!curve) {
									next();
								} else {
									console.log("========= Found curve ", curve.name);
									line.idCurve = curve.idCurve;
									delete line.idLine;
									lineModel.createNewLine(line, function () {
										next();
									}, dbConnection, username);

								}
							})
						}
					}, cb)
				},
				function (cb) {
					async.eachSeries(track.shadings, (shading, next) => {
						shading.idTrack = _track.idTrack;
						shading.createdBy = createdBy;
						shading.updatedBy = updatedBy;
						findCurve(shading.controle_curve, dbConnection, idProject, well, dataset).then(async crtlCurve => {
							shading.idControlCurve = crtlCurve ? crtlCurve.idCurve : null;
							let left_line = await findLine(shading.left_line, dbConnection, _track.idTrack);
							let right_line = await findLine(shading.right_line, dbConnection, _track.idTrack);
							shading.idLeftLine = left_line ? left_line.idLine : null;
							shading.idRightLine = right_line ? right_line.idLine : null;
							dbConnection.Shading.create(shading).then(() => {
								next();
							}).catch(err => {
								console.log(err);
								next();
							});
						});
					}, cb);
				}
			], () => {
				resolve();
			})
		}).catch(err => {
			console.log(err);
			resolve();
		});
	});
}

function checkExistingPlot(payload, plotName, cb, dbConnection) {
	if (payload.overwrite) {
		dbConnection.Plot.findOne({where: {name: plotName}}).then(pl => {
			if (pl) {
				pl.destroy({force: true}).then((a) => {
					cb(a.idPlot);
				}).catch(() => {
					cb(null);
				});
			} else {
				cb(null);
			}
		});
	} else {
		cb(null);
	}
}

module.exports = function (req, done, dbConnection, username) {
	createdBy = req.createdBy;
	updatedBy = req.updatedBy;
	dbConnection.ParameterSet.findByPk(req.body.idParameterSet).then(async param => {
		if (!param) {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No template found"));
		} else {
			let myPlot = param.content;
			let well, dataset;
			if (req.body.idDataset) {
				dataset = await dbConnection.Dataset.findByPk(req.body.idDataset);
				well = dataset ? await dbConnection.Well.findByPk(dataset.idWell) : null;
			} else {
				well = await dbConnection.Well.findByPk(req.body.idWell);
			}
			if (!well) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No well found by id"));
			let idProject = req.body.idProject || well.idProject;
			myPlot.name = dataset ? req.body.plotName + "-" + well.name + "/" + dataset.name : req.body.plotName + "-" + well.name;
			checkExistingPlot(req.body, myPlot.name, (idPlot => {
				if (idPlot) myPlot.idPlot = idPlot;
				createPlot(myPlot, dbConnection, idProject, well, dataset).then(pl => {
					async.waterfall([
						function (cb) {
							async.eachSeries(myPlot.tracks, (track, nextTrack) => {
								createTrack(track, dbConnection, idProject, pl.idPlot, username, well, dataset, req.body.reversedMappingOptions).then(() => {
									nextTrack();
								});
							}, cb);
						},
						function (cb) {
							async.eachSeries(myPlot.depth_axes, (depth_axis, nextDepth) => {
								createDepthAxis(depth_axis, dbConnection, idProject, pl.idPlot, well, {name: 'INDEX'}).then(() => {
									nextDepth();
								});
							}, cb);
						},
						function (cb) {
							async.eachSeries(myPlot.zone_tracks, (zone_track, nextZoneTrack) => {
								createZoneTrack(zone_track, dbConnection, idProject, pl.idPlot, well, dataset).then(() => {
									nextZoneTrack();
								});
							}, cb)
						},
						function (cb) {
							async.eachSeries(myPlot.image_tracks, (image_track, nextImageTrack) => {
								createImageTrack(image_track, dbConnection, idProject, pl.idPlot, well, dataset).then(() => {
									nextImageTrack();
								});
							}, cb)
						}
					], () => {
						dbConnection.Plot.findByPk(pl.idPlot, {include: {all: true, include: {all: true}}}).then(p => {
							done(ResponseJSON(ErrorCodes.SUCCESS, "Done", p));
						});
					});
				}).catch(err => {
					if (err.name === "SequelizeUniqueConstraintError") {
						dbConnection.Plot.findOne({where: {name: myPlot.name}}).then(pl => {
							done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Plot's name already exists! " + myPlot.name, pl));
						});
					} else {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
					}
				});
			}), dbConnection);
		}
	});
};