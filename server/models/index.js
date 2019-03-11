"use strict";
let modelMaster = require('../models-master/index');
let User = modelMaster.User;
let Sequelize = require('sequelize');
let config = require('config').Database;
let configCommon = require('config');

let hashDir = require('../utils/data-tool').hashDir;

let sequelizeCache = new Object();

function SequelizeCache() {
}

SequelizeCache.prototype.put = function (dbName, dbInstance) {
	this[dbName] = dbInstance;
}

SequelizeCache.prototype.get = function (dbName) {
	return this[dbName];
}

SequelizeCache.prototype.remove = function (dbName) {
	delete this[dbName];
}

let __CACHE = new SequelizeCache();
//console.log('start batch job', __CACHE);
setInterval(function () {
	//watchDog
	Object.keys(__CACHE).forEach(function (cache) {
		let dbConnect = __CACHE.get(cache);
		if (Date.now() - dbConnect.timestamp > 1000 * 15 * 60) {
			//delete cache and close sequelize connection if not working for 5 mins
			__CACHE.remove(cache);
			console.log("CLOSED CONNECTION TO : " + cache);
			try {
				dbConnect.instance.sequelize.close();
			} catch (err) {
				console.log("ERR WHILE CLOSE INSTANCE");
			}
		}
	});
}, 1000 * 60);
module.exports = function (dbName, callback, isDelete) {
	if (isDelete) {
		return __CACHE.remove(dbName);
	} else {
		let cacheItem = __CACHE.get(dbName);
		if (cacheItem) {
			cacheItem.timestamp = Date.now();
			return cacheItem.instance;
		} else {
			// No existing dbInstance in the __CACHE ! Create a new one
			cacheItem = {
				instance: null,
				timestamp: Date.now()
			}
			cacheItem.instance = newDbInstance(dbName, callback);
			__CACHE.put(dbName, cacheItem);
			console.log("START CONNECT TO : ", dbName);
			return cacheItem.instance;
		}
	}
}

function newDbInstance(dbName, callback) {
	let object = new Object();
	const sequelize = new Sequelize(dbName, config.user, config.password, {
		host: config.host,
		define: {
			freezeTableName: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		},
		dialect: config.dialect,
		port: config.port,
		logging: config.logging,
		dialectOptions: {
			charset: 'utf8'
		},
		paranoid: true,
		pool: {
			max: 20,
			min: 0,
			idle: 1000 * 60 * 15
		},
		operatorsAliases: Sequelize.Op,
		storage: config.storage
	});
	sequelize.sync()
		.catch(function (err) {
			//console.log(err.message);
			callback(err);
		});

	let models = [
		'Analysis',
		'Annotation',
		'CombinedBox',
		'CombinedBoxTool',
		'CrossPlot',
		'Curve',
		'CustomFill',
		'Dataset',
		'DatasetParams',
		'DepthAxis',
		'Family',
		'FamilyCondition',
		'FamilySpec',
		'FamilyUnit',
		'Flow',
		'Groups',
		'Histogram',
		'HistogramCurveSet',
		'Image',
		'ImageOfTrack',
		'ImageSet',
		'ImageTrack',
		'Line',
		'Marker',
		'MarkerSet',
		'MarkerSetTemplate',
		'MarkerTemplate',
		'ObjectOfTrack',
		'ObjectTrack',
		'OverlayLine',
		'ParameterSet',
		'Plot',
		'PointSet',
		'Polygon',
		'Project',
		'ReferenceCurve',
		'RegressionLine',
		'SelectionTool',
		'Shading',
		'StorageDatabase',
		'Task',
		'TaskSpec',
		'Ternary',
		'Track',
		'UnitGroup',
		'UserDefineLine',
		'Well',
		'WellHeader',
		'Workflow',
		'WorkflowSpec',
		'Zone',
		'ZoneSet',
		'ZoneSetTemplate',
		'ZoneTemplate',
		'ZoneTrack'
	];
	models.forEach(function (model) {
		object[model] = sequelize.import(__dirname + '/' + model);
	});

	(function (m) {
		m.Project.hasMany(m.Well, {
			foreignKey: {
				name: "idProject",
				allowNull: false,
				unique: "name-idProject"
			}, onDelete: 'CASCADE'
		});
		m.Project.hasMany(m.Groups, {
			foreignKey: {
				name: "idProject",
				allowNull: false,
				unique: "name-idProject"
			}, onDelete: 'CASCADE'
		});
		m.Project.hasMany(m.StorageDatabase, {
			foreignKey: {
				name: "idProject",
				allowNull: false,
				uniquie: "name-idProject"
			}, onDelete: 'CASCADE'
		});
		m.Groups.hasMany(m.Well, {
			foreignKey: {
				name: "idGroup",
				allowNull: true
			}
		});

		m.Groups.hasMany(m.Groups, {
			foreignKey: {
				name: "idParent",
				allowNull: true
			}, onDelete: 'CASCADE'
		});

		m.Well.hasMany(m.Dataset, {
			foreignKey: {
				name: "idWell",
				allowNull: false,
				unique: "name-idWell"
			}, onDelete: 'CASCADE', hooks: true
		});
		// m.Well.hasMany(m.Plot, {
		//     foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
		//     onDelete: 'CASCADE'
		// });
		m.Project.hasMany(m.Plot, {
			foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
			onDelete: 'CASCADE'
		});
		m.Well.hasMany(m.ZoneSet, {
			foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
			onDelete: 'CASCADE'
		});
		m.ZoneSet.belongsTo(m.Well, {
			foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
			onDelete: 'CASCADE'
		})

		m.Project.hasMany(m.CrossPlot, {
			foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
			onDelete: 'CASCADE'
		});
		m.Project.hasMany(m.Histogram, {
			foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
			onDelete: 'CASCADE'
		});
		m.Project.hasMany(m.CombinedBox, {
			foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
			onDelete: 'CASCADE'
		});
		m.CombinedBox.belongsTo(m.Project, {
			foreignKey: {name: "idProject", allowNull: false, unique: "name-idProject"},
			onDelete: 'CASCADE'
		});
		m.Well.hasMany(m.WellHeader, {
			foreignKey: {name: "idWell", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.Dataset.hasMany(m.Curve, {
			foreignKey: {
				name: "idDataset",
				allowNull: false,
				unique: "name-idDataset"
			}, onDelete: 'CASCADE', hooks: true
		});
		m.Dataset.hasMany(m.DatasetParams, {
			foreignKey: {
				name: "idDataset",
				allowNull: false
			}, onDelete: 'CASCADE'
		});
		m.Plot.hasMany(m.Track, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
		m.Plot.hasMany(m.DepthAxis, {
			foreignKey: {name: "idPlot", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.Plot.hasMany(m.ImageTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
		m.ImageTrack.hasMany(m.ImageOfTrack, {
			foreignKey: {name: "idImageTrack", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.Plot.hasMany(m.ObjectTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
		m.ObjectTrack.hasMany(m.ObjectOfTrack, {
			foreignKey: {name: "idObjectTrack", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.Plot.hasMany(m.ZoneTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
		m.ZoneTrack.belongsTo(m.ZoneSet, {foreignKey: {name: "idZoneSet", allowNull: true}});//TODO allowNull??


		m.Project.hasMany(m.ZoneSetTemplate, {
			foreignKey: {
				name: "idProject",
				allowNull: true,
				unique: "name-idProject"
			},
			onDelete: "CASCADE"
		});
		m.ZoneSetTemplate.hasMany(m.ZoneTemplate, {
			foreignKey: {name: "idZoneSetTemplate", allowNull: false, unique: "name-idZoneSetTemplate"},
			onDelete: 'CASCADE'
		});
		m.ZoneSetTemplate.hasMany(m.ZoneSet, {
			foreignKey: {name: "idZoneSetTemplate", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.ZoneSet.belongsTo(m.ZoneSetTemplate, {
			foreignKey: {name: "idZoneSetTemplate", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.MarkerSet.belongsTo(m.MarkerSetTemplate, {
			foreignKey: {name: "idMarkerSetTemplate", allowNull: false},
			onDelete: 'CASCADE'
		});
		m.Zone.belongsTo(m.ZoneTemplate, {foreignKey: {name: "idZoneTemplate", allowNull: false}, onDelete: 'CASCADE'});
		m.ZoneSet.hasMany(m.Zone, {foreignKey: {name: "idZoneSet", allowNull: false}, onDelete: 'CASCADE'});


		m.Plot.belongsTo(m.Curve, {foreignKey: 'referenceCurve'});

		m.Track.hasMany(m.Line, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
		m.Track.hasMany(m.Shading, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
		m.Track.hasMany(m.Annotation, {foreignKey: {name: 'idTrack', allowNull: false}, onDelete: 'CASCADE'});
		m.Line.belongsTo(m.Curve, {foreignKey: {name: "idCurve", allowNull: false}, onDelete: 'CASCADE'});

		m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
		m.Family.hasMany(m.FamilySpec, {as: 'family_spec', foreignKey: 'idFamily'});
		m.FamilySpec.belongsTo(m.UnitGroup, {foreignKey: 'idUnitGroup'});
		m.UnitGroup.hasMany(m.FamilyUnit, {foreignKey: 'idUnitGroup'});
		m.Curve.belongsTo(m.Family, {as: 'LineProperty', foreignKey: 'idFamily'});

		m.Shading.belongsTo(m.Line, {foreignKey: 'idLeftLine', as: 'leftLine', onDelete: 'CASCADE'});
		m.Shading.belongsTo(m.Line, {foreignKey: 'idRightLine', as: 'rightLine', onDelete: 'CASCADE'});
		m.Shading.belongsTo(m.Curve, {foreignKey: 'idControlCurve'});

		m.CrossPlot.hasMany(m.Polygon, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
		m.CrossPlot.hasMany(m.RegressionLine, {
			foreignKey: {name: 'idCrossPlot', allowNull: false},
			onDelete: 'CASCADE'
		});
		m.CrossPlot.hasMany(m.ReferenceCurve, {
			foreignKey: {name: 'idCrossPlot', allowNull: true},
			onDelete: 'CASCADE'
		});
		m.CrossPlot.hasMany(m.Ternary, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
		m.CrossPlot.hasMany(m.PointSet, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
		m.CrossPlot.hasMany(m.UserDefineLine, {
			foreignKey: {
				name: 'idCrossPlot',
				allowNull: false,
				onDelete: 'CASCADE'
			}
		});

		m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveX', allowNull: true}});
		m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveY', allowNull: true}});
		m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveZ', allowNull: true}});
		m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveZ1', allowNull: true}});
		m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveZ2', allowNull: true}});
		m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveZ3', allowNull: true}});
		m.PointSet.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
		m.PointSet.belongsTo(m.OverlayLine, {foreignKey: {name: 'idOverlayLine', allowNull: true}});


		// m.Histogram.belongsTo(m.Curve, {foreignKey: 'idCurve'});
		m.Histogram.belongsToMany(m.Curve, {
			through: 'histogram_curve_set',
			foreignKey: 'idHistogram'
		});
		m.Curve.belongsToMany(m.Histogram, {
			through: 'histogram_curve_set',
			foreignKey: 'idCurve'
		});
		m.Histogram.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
		m.Histogram.hasMany(m.ReferenceCurve, {
			foreignKey: {name: 'idHistogram', allowNull: true},
			onDelete: 'CASCADE'
		});

		m.Polygon.belongsToMany(m.RegressionLine, {
			through: 'Polygon_RegressionLine',
			foreignKey: 'idPolygon'
		});
		m.RegressionLine.belongsToMany(m.Polygon, {
			through: 'Polygon_RegressionLine',
			foreignKey: 'idRegressionLine'
		});
		//combined box
		m.CombinedBox.hasMany(m.CombinedBoxTool, {
			foreignKey: {name: "idCombinedBox", allowNull: true},
			onDelete: 'CASCADE'
		});
		m.CombinedBox.belongsToMany(m.Plot, {
			through: 'combined_box_plot',
			foreignKey: 'idCombinedBox'
		});
		m.CombinedBox.belongsToMany(m.CrossPlot, {
			through: 'combined_box_crossplot',
			foreignKey: 'idCombinedBox'
		});
		m.CombinedBox.belongsToMany(m.Histogram, {
			through: 'combined_box_histogram',
			foreignKey: 'idCombinedBox'
		});
		m.Plot.belongsToMany(m.CombinedBox, {
			through: 'combined_box_plot',
			foreignKey: 'idPlot'
		});
		m.CrossPlot.belongsToMany(m.CombinedBox, {
			through: 'combined_box_crossplot',
			foreignKey: 'idCrossPlot'
		});
		m.Histogram.belongsToMany(m.CombinedBox, {
			through: 'combined_box_histogram',
			foreignKey: 'idHistogram'
		});

		//end combined box
		m.ReferenceCurve.belongsTo(m.Curve, {
			foreignKey: {name: 'idCurve', allowNull: false},
			onDelete: 'CASCADE'
		});

		m.CombinedBox.hasMany(m.SelectionTool, {
			foreignKey: {name: 'idCombinedBox', allowNull: false},
			onDelete: 'CASCADE'
		});
		m.CombinedBoxTool.hasOne(m.SelectionTool, {
			foreignKey: {name: 'idCombinedBoxTool', allowNull: false},
			onDelete: 'CASCADE'
		});

		m.Project.hasMany(m.Workflow, {
			foreignKey: {name: 'idProject', allowNull: false, unique: 'name-idProject'},
			onDelete: 'CASCADE'
		});
		m.Project.hasMany(m.ParameterSet, {
			foreignKey: {name: 'idProject', allowNull: false, unique: 'name-idProject'},
			onDelete: 'CASCADE'
		});
		m.Plot.hasOne(m.Workflow, {
			foreignKey: {name: 'idPlot', allowNull: true}
		});
		m.Track.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
		m.ZoneSet.hasMany(m.Track, {foreignKey: {name: 'idZoneSet', allowNull: true}});
		m.Track.belongsTo(m.MarkerSet, {foreignKey: {name: 'idMarkerSet', allowNull: true}});
		m.MarkerSet.hasMany(m.Track, {foreignKey: {name: 'idMarkerSet', allowNull: true}});
		m.WorkflowSpec.hasMany(m.Workflow, {
			foreignKey: {name: 'idWorkflowSpec', allowNull: true},
			onDelete: 'CASCADE'
		});
		m.Project.hasMany(m.Flow, {
			foreignKey: {name: 'idProject', allowNull: true, unique: 'name-idProject'},
			onDelete: 'CASCADE'
		});
		m.Flow.hasMany(m.Task, {
			foreignKey: {name: 'idFlow', allowNull: false, unique: 'name-idFlow'},
			onDelete: 'CASCADE'
		});
		m.TaskSpec.hasMany(m.Task, {
			foreignKey: {name: 'idTaskSpec', allowNull: true},
			onDelete: 'CASCADE'
		});
		m.TaskSpec.hasMany(m.ParameterSet, {
			foreignKey: {name: 'idTaskSpec', allowNull: true},
			onDelete: 'CASCADE'
		});
		m.ParameterSet.belongsTo(m.TaskSpec, {
			foreignKey: {name: 'idTaskSpec', allowNull: true},
			onDelete: 'CASCADE'
		});

		//image Template
		m.Well.hasMany(m.ImageSet, {
			foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"}
		});
		m.ImageSet.belongsTo(m.Well, {
			foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"}
		});
		m.Image.belongsTo(m.ImageSet, {
			foreignKey: {name: "idImageSet", allowNull: false}, onDelete: "CASCADE"
		});
		m.ImageSet.hasMany(m.Image, {
			foreignKey: {name: "idImageSet", allowNull: false}, onDelete: 'CASCADE'
		});
		m.ImageTrack.belongsTo(m.ImageSet, {foreignKey: {name: "idImageSet", allowNull: true}});
		//marker Template
		m.Well.hasMany(m.MarkerSet, {
			foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"}
		});
		m.MarkerSet.belongsTo(m.Well, {
			foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"}
		});
		m.Well.hasMany(m.DepthAxis, {
			foreignKey: {name: "idWell", allowNull: true}
		});
		m.Project.hasMany(m.MarkerSetTemplate, {
			foreignKey: {
				name: "idProject",
				allowNull: true,
				unique: "name-idProject"
			}, onDelete: 'CASCADE'
		});
		m.MarkerSetTemplate.hasMany(m.MarkerTemplate, {
			foreignKey: {name: "idMarkerSetTemplate", allowNull: false, unique: "name-idMarkerSetTemplate"},
			onDelete: "CASCADE"
		});
		m.MarkerSetTemplate.hasMany(m.MarkerSet, {
			foreignKey: {name: "idMarkerSetTemplate", allowNull: false},
			onDelete: "CASCADE"
		});
		m.Marker.belongsTo(m.MarkerTemplate, {
			foreignKey: {name: "idMarkerTemplate", allowNull: false}, onDelete: "CASCADE"
		});
		m.MarkerSet.hasMany(m.Marker, {
			foreignKey: {name: "idMarkerSet", allowNull: false}
		});
		m.DepthAxis.belongsTo(m.Curve, {
			foreignKey: {name: "idCurve", allowNull: true},
		});
		m.Curve.hasMany(m.DepthAxis, {
			foreignKey: {name: "idCurve", allowNull: true}
		});

		m.Analysis.belongsTo(m.Project, {
			foreignKey: {name: "idProject", allowNull: false, unique: 'name-project-type'}, onDelete: "CASCADE"
		});
		m.Project.hasMany(m.Analysis, {
			foreignKey: {name: "idProject", allowNull: false, unique: 'name-project-type'}, onDelete: "CASCADE"
		});
	})(object);

	object.sequelize = sequelize;
	//Register hook
	let Family = object.Family;
	let FamilySpec = object.FamilySpec;
	let FamilyCondition = object.FamilyCondition;
	let Dataset = object.Dataset;
	let Well = object.Well;
	let WellHeader = object.WellHeader;
	let Curve = object.Curve;
	let Histogram = object.Histogram;
	let CrossPlot = object.CrossPlot;
	let Plot = object.Plot;
	let ZoneSet = object.ZoneSet;
	let Zone = object.Zone;
	let Project = object.Project;
	let username = dbName.substring(dbName.indexOf("_") + 1);
	let async = require('async');
	let rename = require('../utils/function').renameObjectForDustbin;
	let curveFunction = require('../utils/curve.function');
	require('../models-hooks/index')(object);
	Curve.addHook('afterCreate', function (curve) {
		if (!curve.idFamily) {
			((curveName, unit) => {
				FamilyCondition.findAll()
					.then(conditions => {
						let result = conditions.find(function (aCondition) {
							let regex;
							try {
								regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curveName) && new RegExp("^" + aCondition.unit + "$", "i").test(unit) && (curve.type === aCondition.type);
								// console.log(aCondition);
							} catch (err) {
								console.log(err);
							}
							return regex;
						});
						if (!result) {
							return;
						}
						result.getFamily()
							.then(aFamily => {
								curve.setLineProperty(aFamily);
							})
					})
			})(curve.name, curve.unit);
		} else {
			Family.findByPk(curve.idFamily, {include: {model: FamilySpec, as: 'family_spec'}}).then(family => {
				curve.unit = curve.unit || family.family_spec[0].unit;
				curve.save();
			}).catch(err => {
				console.log("err while update curve unit ", err);
			});
		}
	});
	Curve.addHook('beforeDestroy', function (curve, options) {
		return new Promise(async function (resolve) {
			let parents = await curveFunction.getFullCurveParents(curve, object);
			parents.username = username;
			if (options.permanently) {
				hashDir.deleteFolder(configCommon.curveBasePath, username + parents.project + parents.well + parents.dataset + parents.curve, parents.curve + '.txt');
				resolve(curve, options);
			} else {
				rename(curve, function (err, newCurve) {
					if (!err) {
						curveFunction.moveCurveData(parents, {
							username: username,
							project: parents.project,
							well: parents.well,
							dataset: parents.dataset,
							curve: newCurve.name
						}, function () {
							object.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
								async.each(lines, function (line, nextLine) {
									line.destroy({hooks: false}).then(() => {
										nextLine();
									});
								}, function () {
									object.ReferenceCurve.findAll({where: {idCurve: curve.idCurve}}).then(refs => {
										async.each(refs, function (ref, nextRef) {
											ref.destroy({hooks: false}).then(() => {
												nextRef();
											}).catch(() => {
												nextRef();
											});
										}, function () {
											resolve(curve, options);
										});
									});
								});
							});
						});
					}
				}, 'delete');
			}
		});
	});

	Well.addHook('beforeDestroy', function (well, options) {
		console.log("Hooks delete well");
		return new Promise(function (resolve) {
			if (options.permanently) {
				resolve(well, options);
			} else {
				let oldName = well.name;
				rename(well, function (err, success) {
					Dataset.findAll({where: {idWell: well.idWell}}).then(datasets => {
						async.each(datasets, function (dataset, nextDataset) {
							Curve.findAll({where: {idDataset: dataset.idDataset}}).then(curves => {
								async.each(curves, function (curve, nextCurve) {
									curveFunction.getFullCurveParents(curve, object).then(curveParents => {
										curveParents.username = username;
										let srcCurve = {
											username: curveParents.username,
											project: curveParents.project,
											well: oldName,
											dataset: curveParents.dataset,
											curve: curveParents.curve
										};
										curveFunction.moveCurveData(srcCurve, curveParents, function () {
											object.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
												async.each(lines, function (line, nextLine) {
													line.destroy({hooks: false}).then(() => {
														nextLine();
													});
												}, function () {
													object.ReferenceCurve.findAll({where: {idCurve: curve.idCurve}}).then(refs => {
														async.each(refs, function (ref, nextRef) {
															ref.destroy({hooks: false}).then(() => {
																nextRef();
															}).catch(() => {
																nextRef();
															})
														}, function () {
															nextCurve();
														})
													});
												});
											});
										});
									})
								}, function () {
									nextDataset();
								});
							})
						}, function () {
							resolve(well, options);
						})
					})
				}, 'delete');
			}
		});
	});

	Dataset.addHook('beforeDestroy', function (dataset, options) {
		console.log("Hooks delete dataset");
		return new Promise(function (resolve, reject) {
			if (options.permanently) {
				resolve(dataset, options);
			} else {
				let oldName = dataset.name;
				rename(dataset, async function (err, success) {
					let curves = await Curve.findAll({where: {idDataset: dataset.idDataset}});
					async.each(curves, function (curve, nextCurve) {
						curveFunction.getFullCurveParents(curve, object).then(curveParents => {
							curveParents.username = username;
							let srcCurve = {
								username: curveParents.username,
								project: curveParents.project,
								well: curveParents.well,
								dataset: oldName,
								curve: curveParents.curve
							};
							curveFunction.moveCurveData(srcCurve, curveParents, function () {
								object.Line.findAll({where: {idCurve: curve.idCurve}}).then(lines => {
									async.each(lines, function (line, nextLine) {
										line.destroy({hooks: false}).then(() => {
											nextLine();
										});
									}, function () {
										object.ReferenceCurve.findAll({where: {idCurve: curve.idCurve}}).then(refs => {
											async.each(refs, function (ref, nextRef) {
												ref.destroy({hooks: false}).then(() => {
													nextRef();
												}).catch(() => {
													nextRef();
												})
											}, function () {
												nextCurve();
											})
										});
									});
								});
							});
						});
					}, function () {
						resolve(dataset, options);
					});
				}, 'delete');
			}
		})

	});

	Dataset.addHook('afterCreate', function (dataset) {
		console.log("Hooks after create dataset");
		Well.findByPk(dataset.idWell).then(w => {
			Project.findByPk(w.idProject).then(p => {
				let createMD = require('../dataset/create-md-curve');
				let parents = {
					username: username,
					project: p.name,
					well: w.name,
					dataset: dataset.name
				};
				createMD(parents, dataset, object).then(c => {
					console.log("Create MD for dataset " + dataset.name + " successful");
				});
			});
		});
	});

	Histogram.addHook('beforeDestroy', function (histogram, options) {
		console.log("Hooks delete histogram");
		if (histogram.deletedAt) {

		} else {
			rename(histogram, null, 'delete');
		}
	});

	CrossPlot.addHook('beforeDestroy', function (crossplot, options) {
		console.log("Hooks delete crossplot");
		if (crossplot.deletedAt) {

		} else {
			rename(crossplot, null, 'delete');
		}
	});

	Plot.addHook('beforeDestroy', function (plot, options) {
		return new Promise(function (resolve, reject) {
			console.log("Hooks delete plot ", options);
			if (options.permanently) {
				resolve(plot, options);
			} else {
				rename(plot, function () {
					resolve(plot, options);
				}, 'delete');
			}
		});


	});

	ZoneSet.addHook('beforeDestroy', function (zoneset, options) {
		console.log("Hooks delete zoneset");
		if (zoneset.deletedAt) {

		} else {
			rename(zoneset, null, 'delete');
		}
	});
	//End register hook
	return object;
}
