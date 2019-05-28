"use strict";
let modelMaster = require('../models-master/index');
let User = modelMaster.User;
let Sequelize = require('sequelize');
let config = require('config').Database;
let configCommon = require('config');
let associate = require('./Relations/index');

let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;

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
			console.log(err.message);
			// callback(err);
		});
        let models = [
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

    associate(object);

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
	Curve.hook('afterCreate', function (curve) {
		if (!curve.idFamily) {
			((curveName, unit) => {
				FamilyCondition.findAll()
					.then(conditions => {
						let result = conditions.find(function (aCondition) {
							let regex;
							try {
								regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curveName) && new RegExp("^" + aCondition.unit + "$", "i").test(unit);
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
			Family.findById(curve.idFamily, {include: {model: FamilySpec, as: 'family_spec'}}).then(family => {
				curve.unit = curve.unit || family.family_spec[0].unit;
				curve.save();
			}).catch(err => {
				console.log("err while update curve unit ", err);
			});
		}
	});
	Curve.hook('beforeDestroy', function (curve, options) {
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

	Well.hook('beforeDestroy', function (well, options) {
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

	Dataset.hook('beforeDestroy', function (dataset, options) {
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

	Dataset.hook('afterCreate', function (dataset) {
		console.log("Hooks after create dataset");
		Well.findById(dataset.idWell).then(w => {
			Project.findById(w.idProject).then(p => {
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

	Histogram.hook('beforeDestroy', function (histogram, options) {
		console.log("Hooks delete histogram");
		if (histogram.deletedAt) {

		} else {
			rename(histogram, null, 'delete');
		}
	});

	CrossPlot.hook('beforeDestroy', function (crossplot, options) {
		console.log("Hooks delete crossplot");
		if (crossplot.deletedAt) {

		} else {
			rename(crossplot, null, 'delete');
		}
	});

	Plot.hook('beforeDestroy', function (plot, options) {
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

	ZoneSet.hook('beforeDestroy', function (zoneset, options) {
		console.log("Hooks delete zoneset");
		if (zoneset.deletedAt) {

		} else {
			rename(zoneset, null, 'delete');
		}
	});
	//End register hook
	return object;
}