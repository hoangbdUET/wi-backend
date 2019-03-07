"use strict";

const config = require('config');
const exporter = require('./export');
const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const asyncLoop = require('async/each');
const fs = require('fs-extra');
const request = require('request');
const rename = require('../utils/function').renameObjectForDustbin;
const curveFunction = require('../utils/curve.function');
const checkPermisson = require('../utils/permission/check-permisison');
const hashDir = require('../utils/data-tool').hashDir;
const async = require('async');
const convertLength = require('../utils/convert-length');
const {Transform} = require('stream');
const _ = require('lodash');
const logMessage = require('../log-message');
let byline = require('byline');

function createNewCurve(curveInfo, done, dbConnection, logger) {
	let Curve = dbConnection.Curve;
	Curve.sync()
		.then(() => {
				let curve = Curve.build({
					idDataset: curveInfo.idDataset,
					name: curveInfo.name,
					dataset: curveInfo.dataset,
					unit: curveInfo.unit,
					type: curveInfo.type,
					createdBy: curveInfo.createdBy,
					updatedBy: curveInfo.updatedBy
				});
				curve.save()
					.then(curve => {
						logger.info(logMessage("CURVE", curve.idCurve, "Created"));
						done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", {idCurve: curve.idCurve}))
					})
					.catch(err => {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Curve " + err));
					});
			},
			() => {
				done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
			}
		)

}

function editCurve(curveInfo, done, dbConnection, username, logger) {
	curveInfo.name = curveInfo.name ? curveInfo.name.toUpperCase() : '';
	delete curveInfo.createdBy;
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Well = dbConnection.Well;
	let Project = dbConnection.Project;
	Curve.findByPk(curveInfo.idCurve)
		.then(curve => {
			if (curve.name.toUpperCase() !== curveInfo.name.toUpperCase()) {
				console.log(curve.name, "-", curveInfo.name);
				Curve.findOne({
					where: {
						idDataset: curve.idDataset,
						name: curveInfo.name
					}
				}).then(foundCurve => {
					if (foundCurve) {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve's name already exists"));
					} else {
						console.log("EDIT CURVE NAME");
						Dataset.findByPk(curve.idDataset).then(dataset => {
							Well.findByPk(dataset.idWell).then(well => {
								Project.findByPk(well.idProject).then(project => {
									let curveName = curve.name;
									curve.idDataset = curveInfo.idDataset ? curveInfo.idDataset : curve.idDataset;
									curve.name = curveInfo.name;
									curve.unit = curveInfo.unit ? curveInfo.unit : curve.unit;
									curve.updatedBy = curveInfo.updatedBy;
									curve.save()
										.then(() => {
											let path = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curveName, curveName + '.txt');
											let newPath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curveInfo.name, curveInfo.name + '.txt');
											let copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
											copy.on('close', function () {
												hashDir.deleteFolder(config.curveBasePath, username + project.name + well.name + dataset.name + curveName);
											});
											copy.on('error', function (err) {
												return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit Curve name", err));
											});
											logger.info(logMessage("CURVE", curveInfo.idCurve, "Edit curve success"));
											done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
										})
										.catch(err => {
											if (err.name === "SequelizeUniqueConstraintError") {
												done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve's name already exists"));
											} else {
												done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
											}
										});
								});
							});
						}).catch(err => {
							console.log(err);
						});
					}
				}).catch(err => {

				})
			} else {
				console.log("EDIT CURVE");
				Object.assign(curve, curveInfo)
					.save()
					.then((rs) => {
						// let Family = dbConnection.Family;
						// Family.findByPk(rs.idFamily).then(family => {
						//     let Line = dbConnection.Line;
						//     Line.findAll({where: {idCurve: rs.idCurve}}).then(lines => {
						//         if (lines.length > 0) {
						//             asyncLoop(lines, function (line, next) {
						//                 line.minValue = family ? family.minScale : line.minValue;
						//                 line.maxValue = family ? family.maxScale : line.maxValue;
						//                 line.unit = rs.unit;
						//                 Object.assign(line, line).save();
						//                 next();
						//             }, function (err) {
						//                 done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
						//             });
						//         } else {
						//             done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", curveInfo));
						//         }
						//     }).catch(err => {
						//         console.log(err);
						//         done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.meesage));
						//     });
						// }).catch(err => {
						//     console.log(err);
						//     done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Curve " + err.meesage));
						// });
						logger.info(logMessage("CURVE", curveInfo.idCurve, "Edit curve success"));
						done(ResponseJSON(ErrorCodes.SUCCESS, "Edit curve success", rs));
					})
					.catch(err => {
						if (err.name === "SequelizeUniqueConstraintError") {
							done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve existed!"));
						} else {
							done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
						}
					})
			}

		})
		.catch(() => {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for edit"));
		})
}


function getCurveInfo(curve, done, dbConnection, username) {
	let Curve = dbConnection.Curve;
	Curve.findByPk(curve.idCurve, {
		include: {
			model: dbConnection.Family,
			as: 'LineProperty',
			include: {
				model: dbConnection.FamilySpec,
				as: 'family_spec',
				// where: {isDefault: true}
			}
		}
	})
		.then(curve => {
			if (!curve) throw "not exits";
			calculateScale(curve.idCurve, username, dbConnection, function (err, result) {
				if (!result) result = {
					minScale: NaN,
					maxScale: NaN,
					meanValue: NaN,
					medianValue: NaN
				};
				// console.log(result);
				if (!curve.idFamily) {
					curve = curve.toJSON();
					curve.DataStatistic = {
						minValue: NaN,
						maxValue: NaN,
						meanValue: NaN,
						medianValue: NaN
					};
					if (err) {
						curve.LineProperty = {
							name: "Khong tinh duoc :(((",
							minScale: 0,
							maxScale: 200,
						};
					} else {
						curve.LineProperty = {
							"idFamily": null,
							"name": null,
							"familyGroup": null,
							"unit": null,
							"minScale": parseFloat(result.minScale),
							"maxScale": parseFloat(result.maxScale),
							"displayType": "Linear",
							"displayMode": "Line",
							"blockPosition": "NONE",
							"lineStyle": "[0]",
							"lineWidth": 1,
							"lineColor": "red",
						};
						curve.DataStatistic.minValue = _.isFinite(result.minScale) ? parseFloat(result.minScale) : NaN;
						curve.DataStatistic.maxValue = _.isFinite(result.maxScale) ? parseFloat(result.maxScale) : NaN;
						curve.DataStatistic.meanValue = _.isFinite(result.meanValue) ? parseFloat(result.meanValue) : NaN;
						curve.DataStatistic.medianValue = _.isFinite(result.medianValue) ? parseFloat(result.medianValue) : NaN;
					}
					done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curve));
				} else {
					let curveObj = curve.toJSON();
					curveObj.DataStatistic = {
						minValue: 0,
						maxValue: 0,
						meanValue: 0,
						medianValue: 0
					};
					curveObj.LineProperty.blockPosition = curveObj.LineProperty.family_spec[0].blockPosition;
					curveObj.LineProperty.displayMode = curveObj.LineProperty.family_spec[0].displayMode;
					curveObj.LineProperty.displayType = curveObj.LineProperty.family_spec[0].displayType;
					curveObj.LineProperty.lineColor = curveObj.LineProperty.family_spec[0].lineColor;
					curveObj.LineProperty.lineStyle = curveObj.LineProperty.family_spec[0].lineStyle;
					curveObj.LineProperty.lineWidth = curveObj.LineProperty.family_spec[0].lineWidth;
					curveObj.LineProperty.maxScale = curveObj.LineProperty.family_spec[0].maxScale;
					curveObj.LineProperty.minScale = curveObj.LineProperty.family_spec[0].minScale;
					curveObj.LineProperty.unit = curveObj.LineProperty.family_spec[0].unit;
					curveObj.DataStatistic.minValue = _.isFinite(result.minScale) ? parseFloat(result.minScale) : NaN;
					curveObj.DataStatistic.maxValue = _.isFinite(result.maxScale) ? parseFloat(result.maxScale) : NaN;
					curveObj.DataStatistic.meanValue = _.isFinite(result.meanValue) ? parseFloat(result.meanValue) : NaN;
					curveObj.DataStatistic.medianValue = _.isFinite(result.medianValue) ? parseFloat(result.medianValue) : NaN;
					delete curveObj.LineProperty.family_spec;
					done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Curve success", curveObj));
				}
			});
		})
		.catch((e) => {
			console.log(e);
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found for get info"));
		});
}

async function deleteCurve(curveInfo, done, dbConnection, username, logger) {
	let Curve = dbConnection.Curve;
	let curve = await Curve.findByPk(curveInfo.idCurve);
	curve.setDataValue('updatedBy', curveInfo.updatedBy);
	if (!curve) return done(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id");

	curve.destroy({permanently: true, force: true}).then(() => {
		logger.info(logMessage("CURVE", curve.idCurve, "Curve deleted"));
		done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", curve));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
	});
}


function getDataFile(param, successFunc, errorFunc, dbConnection, username) {
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Well = dbConnection.Well;
	let Project = dbConnection.Project;
	Curve.findByPk(param.idCurve)
		.then(curve => {
			if (curve) {
				Dataset.findByPk(curve.idDataset).then((dataset) => {
					if (!dataset) {
						console.log("No dataset");
					} else {
						Well.findByPk(dataset.idWell).then(well => {
							if (well) {
								Project.findByPk(well.idProject).then(project => {
									console.log("Hash : ", config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
									let path = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt')
									successFunc(fs.createReadStream(path));
								})
							}
						});
					}
				}).catch(err => {
					errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset for curve not found"));
				});
			} else {
				// errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
				errorFunc(ResponseJSON(ErrorCodes.SUCCESS, "Curve not found"));
			}
		})
		.catch((err) => {
			console.log(err);
			errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
		});
}

function getData(param, successFunc, errorFunc, dbConnection, username) {
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Well = dbConnection.Well;
	let Project = dbConnection.Project;
	Curve.findByPk(param.idCurve)
		.then(curve => {
			if (curve) {
				Dataset.findByPk(curve.idDataset).then((dataset) => {
					if (!dataset) {
						console.log("No dataset");
					} else {
						Well.findByPk(dataset.idWell).then(well => {
							if (well) {
								Project.findByPk(well.idProject).then(project => {
									let isRef = checkCurveIsReference(curve);
									let rate = 1;
									if (isRef && !param.isRaw) {
										rate = convertLength.getDistanceRate(curve.unit, 'm');
									}
									console.log("Hash : ", config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
									try {
										if (param.columnIndex && param.columnIndex.length > 0) {
											param.columnIndex.forEach(v => {
												if (v + 1 > curve.dimension) {
													throw ("Not valid column index");
												}
											})
										}
										let dataKey = username + project.name + well.name + dataset.name + curve.name;
										hashDir.createJSONReadStream(config.curveBasePath, dataKey, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n',
											function (err, stream) {
												if (err) {
													errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve Data Was Lost"));
												} else {
													successFunc(stream);
												}
											}, {
												isCore: (dataset.step === 0 || dataset.step === '0'),
												rate: rate,
												type: curve.type,
												columnIndex: param.columnIndex,
											}
										);
									} catch (e) {
										console.log("LOI ", e);
										return errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, e));
									}
								});
							}
						});
					}
				}).catch(err => {
					errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset for curve not found"));
				});
			} else {
				// errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
				errorFunc(ResponseJSON(ErrorCodes.SUCCESS, "Curve not found"));
			}
		})
		.catch((err) => {
			console.log(err);
			errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
		});
}

function exportData(param, successFunc, errorFunc, dbConnection, username) {
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Well = dbConnection.Well;
	let Project = dbConnection.Project;
	Curve.findByPk(param.idCurve)
		.then(function (curve) {
			if (curve) {
				Dataset.findByPk(curve.idDataset).then((dataset) => {
					if (!dataset) {
						console.log("No dataset");
					} else {
						Well.findByPk(dataset.idWell).then(well => {
							if (well) {
								Project.findByPk(well.idProject).then(project => {
									let stream = hashDir.createReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
									stream.on('error', function (err) {
										errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve Data Was Lost"));
									});
									exporter.exportData(stream, successFunc);
								});
							}
						});

					}
				}).catch(err => {
					errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Dataset for curve not found"));
				});

			} else {

			}

		})
		.catch(function () {
			errorFunc(404);
		})
};

let getScale = function (req, done, dbConnection) {
	calculateScale(req.body.idCurve, req.decoded.username, dbConnection, function (err, result) {
		if (err) {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
		} else {
			done(ResponseJSON(ErrorCodes.SUCCESS, "min max curve success", result));
		}
	});
};

let calculateScale = function (idCurve, username, dbConnection, callback) {
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Project = dbConnection.Project;
	let Well = dbConnection.Well;
	Curve.findByPk(idCurve, {paranoid: false})
		.then(function (curve) {
			if (curve) {
				Dataset.findByPk(curve.idDataset, {paranoid: false}).then((dataset) => {
					if (!dataset) {
						console.log("No dataset");
					} else {
						Well.findByPk(dataset.idWell, {paranoid: false}).then(well => {
							if (well) {
								Project.findByPk(well.idProject, {paranoid: false}).then(project => {
									console.log("Hash : ", config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
									let inputStream = hashDir.createReadStream(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
									inputStream.on("error", function () {
										callback("Curve Data Was Lost", null);
									});
									let lineReader = require('readline').createInterface({
										input: inputStream
									});
									lineReader.on('error', function (err) {
										console.log("LOI NA");
										lineReader.close();
									});
									let arrY = [];
									lineReader.on('line', function (line) {
										let arrXY = line.split(/\s+/g).slice(1, 2);
										if (arrXY[0] !== 'null' && arrXY[0] !== 'NaN') {
											arrY.push(arrXY[0]);
										}
									});

									lineReader.on('close', function () {
										//console.log(arrY);
										let median = require('compute-median');
										let medianArray = [];
										let min = parseFloat(arrY[0]);
										let max = parseFloat(arrY[0]);
										let sum = 0;
										arrY.forEach(function (element, i) {
											if (element !== 'null' && element !== 'NaN') {
												element = parseFloat(element);
												sum += element;
												if (element < min) min = element;
												if (element > max) max = element;
												medianArray.push(element);
											}
										});
										callback(null, {
											minScale: min,
											maxScale: max,
											meanValue: sum / arrY.length,
											medianValue: median(medianArray)
										});
									});
								}).catch(err => {
									console.log("LOI : ", err);
								});
							}
						});

					}
				}).catch(err => {
					callback(err, null);
				});

			} else {
				console.log("No curve");
			}

		})
		.catch(function (err) {
			callback(err, null)
		})
};

let processingCurve = function (req, done, dbConnection, createdBy, updatedBy, logger) {
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Well = dbConnection.Well;
	let Project = dbConnection.Project;
	let idDataset = req.body.idDataset;
	let filePath = req.tmpPath;
	let newCurveName = req.body.curveName ? req.body.curveName.toUpperCase() : null;
	let unit = req.body.unit ? req.body.unit === 'null' ? '' : req.body.unit : '';
	let idFamily = req.body.idFamily ? (req.body.idFamily === 'null' ? null : req.body.idFamily) : null;
	let idDesCurve = req.body.idDesCurve;
	let type = req.body.type;
	Dataset.findByPk(idDataset).then(dataset => {
		if (dataset) {
			Well.findByPk(dataset.idWell).then(well => {
				Project.findByPk(well.idProject).then(project => {
					if (newCurveName && newCurveName !== 'null') {
						//create new curve
						Curve.create({
							name: newCurveName,
							unit: unit,
							idDataset: idDataset,
							type: type,
							idFamily: idFamily,
							createdBy: createdBy,
							updatedBy: updatedBy
						}).then(curve => {
							let newPath = hashDir.createPath(config.curveBasePath, req.decoded.username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
							fs.copy(filePath, newPath, function (err) {
								if (err) {
									console.log("ERR COPY FILE : ", err);
								}
								console.log("Copy file success!");
								fs.unlink(filePath);
								logger.info(logMessage("CURVE", curve.idCurve, "Created"));
								done(ResponseJSON(ErrorCodes.SUCCESS, "Success", curve));
							});
						}).catch(err => {
							fs.unlink(filePath);
							if (err.name === "SequelizeUniqueConstraintError") {
								done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve's name already exists"));
							} else {
								done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
							}

						});
					} else {
						//overwrite curve
						Curve.findByPk(idDesCurve).then(curve => {
							if (curve) {
								checkPermisson(req.updatedBy, 'curve.update', function (perm) {
									if (perm) {
										let overwriteInfo = type ? {
											unit: unit || curve.unit,
											idFamily: idFamily || curve.idFamily,
											type: type
										} : {
											unit: unit || curve.unit,
											idFamily: idFamily || curve.idFamily,
										};
										let response = {};
										let newPath = hashDir.createPath(config.curveBasePath, req.decoded.username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
										fs.copy(filePath, newPath, function (err) {
											if (err) {
												console.log("ERR COPY FILE : ", err);
											}
											console.log("Copy file success!");
											fs.unlink(filePath);
											Object.assign(curve, overwriteInfo).save().then((c) => {
												logger.info(logMessage("CURVE", curve.idCurve, "Updated data"));
												done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", c));
											}).catch(err => {
												done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
											})
										});
									} else {
										fs.unlink(filePath);
										done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve : Do not have permission"));
									}
								}, curve.createdBy);
							} else {
								fs.unlink(filePath);
								done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve not exists"));
							}
						});
					}
				});
			})
		} else {
			console.log("No dataset");
			fs.unlink(filePath);
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Dataset"));
		}
	}).catch();
};

async function getCurveDataFromInventory(curveInfo, token, callback, dbConnection, username, createdBy, updatedBy) {
	let options = {
		method: 'POST',
		url: config.Service.inventory + '/user/well/dataset/curve/data',
		headers:
			{
				Authorization: token,
				'Content-Type': 'application/json'
			},
		body: {idCurve: curveInfo.idInvCurve},
		json: true,
		strictSSL: false
	};
	let idDataset = curveInfo.idDesDataset;
	let dataset = await dbConnection.Dataset.findByPk(idDataset);
	let well = await dbConnection.Well.findByPk(dataset.idWell);
	let project = await dbConnection.Project.findByPk(well.idProject);
	let curve = {};
	curve.name = curveInfo.name;
	curve.unit = curveInfo.unit;
	curve.type = curveInfo.type;
	curve.description = curveInfo.description;
	curve.dimension = curveInfo.dimension;
	curve.idDataset = dataset.idDataset;
	dbConnection.Curve.findOrCreate({
		where: {
			name: curve.name,
			idDataset: curve.idDataset
		},
		defaults: {
			name: curve.name,
			idDataset: curve.idDataset,
			unit: curve.unit,
			type: curve.type,
			dimention: curve.dimension,
			createdBy: createdBy,
			updatedBy: updatedBy,
			description: curve.description
		}
	}).then(rs => {
		// console.log(rs);
		let _curve = rs[0];
		let curvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, _curve.name + '.txt');
		console.log(curvePath);
		try {
			let stream = request(options).pipe(fs.createWriteStream(curvePath));
			stream.on('close', function () {
				callback(null, _curve);
			});
			stream.on('error', function (err) {
				callback(err, null);
			});
		} catch (err) {
			callback(err, null);
		}
	}).catch(err => {
		console.log(err);
		callback(err, null);
	});
}


function checkCurveIsReference(curveInfo) {
	let referenceName = ['TVD', 'TVDSS', 'MD', '__MD', '_MD', 'DEPTH', 'XOFFSET', 'YOFFSET'];
	let referenceUnit = convertLength.getUnitTable();
	return !!(referenceName.includes(curveInfo.name.toUpperCase()) && referenceUnit[curveInfo.unit]);
}

function getCurveDataFromInventoryPromise(curveInfo, token, dbConnection, username, createdBy, updatedBy, logger) {
	let start = new Date();
	return new Promise(async function (resolve, reject) {
		let options = {
			method: 'POST',
			url: config.Service.inventory + '/user/well/dataset/curve/data',
			headers:
				{
					Authorization: token,
					'Content-Type': 'application/json'
				},
			body: {idCurve: curveInfo.idInvCurve},
			json: true,
			strictSSL: false
		};
		let idDataset = curveInfo.idDesDataset;
		let dataset = await dbConnection.Dataset.findByPk(idDataset);
		let well = await dbConnection.Well.findByPk(dataset.idWell);
		let project = await dbConnection.Project.findByPk(well.idProject);
		let curve = {};
		curve.name = curveInfo.name;
		curve.unit = curveInfo.unit;
		curve.type = curveInfo.type;
		curve.description = curveInfo.description;
		curve.idDataset = dataset.idDataset;
		curve.dimension = curveInfo.dimension;
		dbConnection.Curve.findOrCreate({
			where: {
				name: curve.name,
				idDataset: curve.idDataset
			},
			defaults: {
				name: curve.name,
				idDataset: curve.idDataset,
				unit: curve.unit,
				type: curve.type,
				dimension: curve.dimension,
				createdBy: createdBy,
				updatedBy: updatedBy,
				description: curve.description
			}
		}).then(rs => {
			let _curve = rs[0];
			let curvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, _curve.name + '.txt');
			console.log("Import ", curvePath);
			// if (_curve.type === "ARRAY") {
			// 	if (false) {
			// 	// const {Transform} = require('stream');
			// 	const byline = require('byline');
			// 	fs.writeFileSync(hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, 'DEPTH.txt'), '');
			// 	for (let i = 0; i < _curve.dimension; i++) {
			// 		fs.writeFileSync(hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, _curve.name + '_' + i + '.txt'), '');
			// 	}
			// 	const splitData = new Transform({
			// 		transform(chunk, encoding, callback) {
			// 			this.push(chunk);
			// 			let arr = chunk.toString().split(/\s+/);
			// 			fs.appendFileSync(hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, 'DEPTH.txt'), arr[0] + '\n');
			// 			for (let i = 1; i < arr.length; i++) {
			// 				fs.appendFileSync(hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, _curve.name + '_' + (i - 1) + '.txt'), arr[i] + '\n');
			// 			}
			// 			callback();
			// 		}
			// 	});
			// 	let stream = byline.createStream(request(options)).pipe(splitData);
			// 	stream.on('close', () => {
			// 		resolve(_curve);
			// 	});
			// 	stream.on('error', (err) => {
			// 		console.log(err);
			// 		reject(err);
			// 	});
			// } else {
			try {
				let stream = request(options).pipe(fs.createWriteStream(curvePath));
				stream.on('close', function () {
					logger.info(logMessage("CURVE", _curve.idCurve, "Created"));
					console.log("Import Done ", curvePath, " : ", new Date() - start, "ms");
					resolve(_curve);
				});
				stream.on('error', function (err) {
					reject(err);
				});
			} catch (err) {
				reject(err);
			}
			// }
		}).catch(err => {
			console.log(err);
			reject(err);
		});
	});
}

function duplicateCurve(data, done, dbConnection, username, logger) {
	dbConnection.Curve.findByPk(data.idCurve).then(async curve => {
		if (curve) {
			try {
				let dataset = await dbConnection.Dataset.findByPk(curve.idDataset);
				let well = await dbConnection.Well.findByPk(dataset.idWell);
				let project = await dbConnection.Project.findByPk(well.idProject);
				let curvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
				let newCurve = curve.toJSON();
				newCurve.createdBy = data.createdBy;
				newCurve.updatedBy = data.updatedBy;
				newCurve.name = curve.name + '_COPY_' + curve.duplicated;
				delete newCurve.idCurve;
				curve.duplicated += 1;
				await curve.save();
				dbConnection.Curve.create(newCurve).then(_Curve => {
					let newCurvePath = hashDir.createPath(config.curveBasePath, username + project.name + well.name + dataset.name + _Curve.name, _Curve.name + '.txt');
					fs.copy(curvePath, newCurvePath, function (err) {
						if (err) {
							throw err;
						}
						logger.info(logMessage("CURVE", curve.idCurve, "Duplicated"));
						done(ResponseJSON(ErrorCodes.SUCCESS, "Done", _Curve));
					});

				}).catch(err => {
					console.log(err);
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message))
				})
			} catch (err) {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err : " + err.message, err))
			}
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by ID"));
		}
	});
}

function checkCurveExisted(payload, callback, dbConnection) {
	dbConnection.Curve.findOne({
		where: {
			name: payload.name.toUpperCase(),
			idDataset: payload.idDataset,
			deletedAt: null
		}
	}).then(c => {
		if (c) {
			callback(ResponseJSON(ErrorCodes.SUCCESS, "Found curve", c));
		} else {
			callback(ResponseJSON(ErrorCodes.SUCCESS, "No curve found by name"));
		}
	}).catch(err => {
		callback(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
	})
}

function getCurveParents(payload, done, dbConnection) {
	let response = {};
	dbConnection.Curve.findByPk(payload.idCurve).then(async curve => {
		if (curve) {
			response.dataset = await dbConnection.Dataset.findByPk(curve.idDataset);
			response.well = await dbConnection.Well.findByPk(response.dataset.idWell);
			response.project = await dbConnection.Project.findByPk(response.well.idProject);
			response.curve = curve;
			done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id"));
		}
	});
}

function getCurveByName(name, idDataset, callback, dbConnection) {
	dbConnection.Curve.findOne({
		where: {
			name: name,
			idDataset: idDataset
		}
	}).then(function (curve) {
		callback(null, curve);
	}).catch(function (err) {
		callback(err);
	})
}

function resyncFamily(payload, done, dbConnection) {
	dbConnection.Curve.findAll().then(curves => {
		async.eachSeries(curves, function (curve, next) {
			let curveName = curve.name;
			let unit = curve.unit;
			if (curveName === '__MD') {
				curve.idFamily = 743;
				curve.save();
				next();
			} else {
				dbConnection.FamilyCondition.findAll()
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
							next();
						} else {
							result.getFamily()
								.then(aFamily => {
									curve.setLineProperty(aFamily);
									next();
								}).catch(() => {
								next();
							});
						}
					});
			}
		}, function () {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Done", curves));
		})
	});
}

function processingArrayCurve(req, done, dbConnection, createdBy, updatedBy, logger) {
	dbConnection.Curve.findByPk(req.body.idCurve).then(curve => {
		if (!curve) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id"));
		if (curve.type !== "ARRAY") return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "This is not array curve"));
		if (!req.body.columnIndex || (curve.dimension < +req.body.columnIndex + 1 || +req.body.columnIndex < 0))
			return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not valid column index"));
		curveFunction.getFullCurveParents({idCurve: req.body.idCurve}, dbConnection).then(curveParent => {
			let path = hashDir.createPath(config.curveBasePath, createdBy + curveParent.project + curveParent.well + curveParent.dataset + curveParent.curve, curveParent.curve + '.txt');
			let output = fs.createWriteStream(path + '_');
			let stream = byline(fs.createReadStream(path));
			let count = 0;
			stream.on('data', (line) => {
				let valueToken = line.toString().split(/\s+/);
				valueToken[+req.body.columnIndex + 1] = req.tmpData[count];
				output.write(_.join(valueToken, ' ') + '\n');
				count++;
			});
			stream.on('end', () => {
				fs.copy(path + '_', path, err => {
					if (err) console.log(err);
					console.log("Edit array data done, remove tmp");
					output.close();
					fs.unlink(path + '_');
				});
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", curve));
			});
		});
	});
}

function splitArrayCurve(payload, done, dbConnection) {

}

function mergeCurvesIntoArrayCurve(payload, done, dbConnection) {

}


module.exports = {
	resyncFamily: resyncFamily,
	createNewCurve: createNewCurve,
	editCurve: editCurve,
	deleteCurve: deleteCurve,
	getCurveInfo: getCurveInfo,
	getData: getData,
	getDataFile: getDataFile,
	exportData: exportData,
	getScale: getScale,
	calculateScale: calculateScale,
	processingCurve: processingCurve,
	getCurveDataFromInventory: getCurveDataFromInventory,
	duplicateCurve: duplicateCurve,
	checkCurveExisted: checkCurveExisted,
	getCurveParents: getCurveParents,
	getCurveByName: getCurveByName,
	getCurveDataFromInventoryPromise: getCurveDataFromInventoryPromise,
	processingArrayCurve: processingArrayCurve,
	splitArrayCurve: splitArrayCurve,
	mergeCurvesIntoArrayCurve: mergeCurvesIntoArrayCurve
};