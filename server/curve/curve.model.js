"use strict";

const config = require('config');
const exporter = require('./export');
const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const fs = require('fs-extra');
const mFs = require('fs');
const request = require('request');
const curveFunction = require('../utils/curve.function');
const checkPermisson = require('../utils/permission/check-permisison');
const hashDir = require('../utils/data-tool').hashDir;
const async = require('async');
const convertLength = require('../utils/convert-length');
const _ = require('lodash');
const byline = require('byline');

function createNewCurve(curveInfo, done, dbConnection) {
	let Curve = dbConnection.Curve;
	Curve.sync()
		.then(() => {
			let curve = Curve.build(Object.assign({
				idDataset: curveInfo.idDataset,
				name: curveInfo.name,
				dataset: curveInfo.dataset,
				unit: curveInfo.unit,
				type: curveInfo.type,
				dimension: curveInfo.dimension || 1,
				createdBy: curveInfo.createdBy,
				updatedBy: curveInfo.updatedBy
			}, curveInfo));
			curve.save()
				.then(curve => {
					done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Curve success", { idCurve: curve.idCurve }))
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

function editCurve(curveInfo, done, dbConnection, username) {
	curveInfo.name = curveInfo.name ? curveInfo.name.toUpperCase() : '';
	delete curveInfo.createdBy;
	let Curve = dbConnection.Curve;
	let Dataset = dbConnection.Dataset;
	let Well = dbConnection.Well;
	let Project = dbConnection.Project;
	Curve.findByPk(curveInfo.idCurve)
		.then(curve => {
			if (curve.name !== curveInfo.name) {
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
											let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curveName, curveName + '.txt');
											let newPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curveInfo.name, curveInfo.name + '.txt');
											let copy = fs.createReadStream(path).pipe(fs.createWriteStream(newPath));
											copy.on('close', function () {
												hashDir.deleteFolder(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curveName);
											});
											copy.on('error', function (err) {
												return done(ResponseJSON(ErrorCodes.INTERNAL_SERVER_ERROR, "Can't edit Curve name", err));
											});
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

async function deleteCurve(curveInfo, done, dbConnection, username) {
	let Curve = dbConnection.Curve;
	let curve = await Curve.findByPk(curveInfo.idCurve);
	curve.setDataValue('updatedBy', curveInfo.updatedBy);
	if (!curve) return done(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id");

	curve.destroy({ permanently: true, force: true }).then(() => {
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
									console.log("Hash : ", process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
									let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt')
									const dataStream = fs.createReadStream(path);
									dataStream.on('error', function (err) {
										errorFunc(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Curve not found"));
									});
									successFunc(dataStream);
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
									console.log("Hash : ", process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
									try {
										if (param.columnIndex && param.columnIndex.length > 0) {
											param.columnIndex.forEach(v => {
												if (v + 1 > curve.dimension) {
													throw ("Not valid column index");
												}
											})
										}
										let dataKey = username + project.name + well.name + dataset.name + curve.name;
										hashDir.createJSONReadStream(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, dataKey, curve.name + '.txt', '{\n"code": 200,\n"content":', '}\n',
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
									let stream = hashDir.createReadStream(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
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
	Curve.findByPk(idCurve, { paranoid: false })
		.then(function (curve) {
			if (curve) {
				Dataset.findByPk(curve.idDataset, { paranoid: false }).then((dataset) => {
					if (!dataset) {
						console.log("No dataset");
					} else {
						Well.findByPk(dataset.idWell, { paranoid: false }).then(well => {
							if (well && curve.type === "NUMBER") {
								Project.findByPk(well.idProject, { paranoid: false }).then(project => {
									console.log("Hash : ", process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
									let inputStream = hashDir.createReadStream(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
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
										if (arrXY[0] !== 'null' && arrXY[0] !== 'NaN' && arrXY[0] !== '') {
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
											if (element !== 'null' && element !== 'NaN' && element !== '') {
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
							} else {
								callback(null, {
									minScale: NaN,
									maxScale: NaN,
									meanValue: NaN,
									medianValue: NaN
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

let processingCurve = function (req, done, dbConnection, createdBy, updatedBy) {
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
	let dimension = req.body.dimension || 1;
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
							updatedBy: updatedBy,
							dimension: dimension
						}).then(curve => {
							console.log("===", req.decoded.username);
							let newPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, req.decoded.username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
							fs.copy(filePath, newPath, function (err) {
								if (err) {
									console.log("ERR COPY FILE : ", err);
								}
								console.log("Copy file success!");
								fs.unlink(filePath);
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
											type: type,
											dimension: dimension
										} : {
												unit: unit || curve.unit,
												idFamily: idFamily || curve.idFamily,
											};
										let response = {};
										let newPath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, req.decoded.username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
										fs.copy(filePath, newPath, function (err) {
											if (err) {
												console.log("ERR COPY FILE : ", err);
											}
											console.log("Copy file success!");
											fs.unlink(filePath);
											Object.assign(curve, overwriteInfo).save().then((c) => {
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
		url: (process.env.BACKEND_INV_SERVICE || config.Service.inventory) + '/user/well/dataset/curve/data',
		headers:
		{
			Authorization: token,
			'Content-Type': 'application/json'
		},
		body: { idCurve: curveInfo.idInvCurve },
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
			dimension: curve.dimension,
			createdBy: createdBy,
			updatedBy: updatedBy,
			description: curve.description
		}
	}).then(rs => {
		// console.log(rs);
		let _curve = rs[0];
		let curvePath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + _curve.name, _curve.name + '.txt');
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

function getCurveDataFromInventoryPromise(curveInfo, token, dbConnection, username, createdBy, updatedBy) {
	let start = new Date();
	return new Promise(async function (resolve, reject) {
		let options = {
			method: 'POST',
			url: (process.env.BACKEND_INV_SERVICE || config.Service.inventory) + '/user/well/dataset/curve/data',
			headers:
			{
				Authorization: token,
				'Content-Type': 'application/json'
			},
			body: { idCurve: curveInfo.idInvCurve },
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
		let curvePath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
		console.log("Import ", curvePath);
		try {
			let stream = request(options).pipe(fs.createWriteStream(curvePath));
			// console.log("Get data from inventory");
			stream.on('close', function () {
				// console.log("Get data from inventory done");
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
					console.log("Import Done ", curvePath, " : ", new Date() - start, "ms");
					resolve(_curve);
					// }
				}).catch(err => {
					console.log(err);
					reject(err);
				});
			});
			stream.on('error', function (err) {
				// console.log("Get data from inventory error");
				reject(err);
			});
		} catch (err) {
			reject(err);
		}
	});
}

function duplicateCurve(data, done, dbConnection, username) {
	dbConnection.Curve.findByPk(data.idCurve).then(async curve => {
		if (curve) {
			try {
				let dataset = await dbConnection.Dataset.findByPk(curve.idDataset);
				let well = await dbConnection.Well.findByPk(dataset.idWell);
				let project = await dbConnection.Project.findByPk(well.idProject);
				let curvePath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt');
				let newCurve = curve.toJSON();
				newCurve.createdBy = data.createdBy;
				newCurve.updatedBy = data.updatedBy;
				newCurve.name = curve.name + '_COPY_' + curve.duplicated;
				delete newCurve.idCurve;
				curve.duplicated += 1;
				await curve.save();
				dbConnection.Curve.create(newCurve).then(_Curve => {
					let newCurvePath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + _Curve.name, _Curve.name + '.txt');
					fs.copy(curvePath, newCurvePath, function (err) {
						if (err) {
							throw err;
						}
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
								regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curveName) && new RegExp("^" + aCondition.unit + "$", "i").test(unit) && (curve.type === aCondition.type);
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

function processingArrayCurve(req, done, dbConnection, createdBy, updatedBy) {
	dbConnection.Curve.findByPk(req.body.idCurve).then(curve => {
		if (!curve) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id"));
		if (curve.type !== "ARRAY") return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "This is not array curve"));
		if (!req.body.columnIndex || (curve.dimension < +req.body.columnIndex + 1 || +req.body.columnIndex < 0))
			return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Not valid column index"));
		curveFunction.getFullCurveParents({ idCurve: req.body.idCurve }, dbConnection).then(curveParent => {
			let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, req.decoded.username + curveParent.project + curveParent.well + curveParent.dataset + curveParent.curve, curveParent.curve + '.txt');
			let tmpPath = Date.now() + '';
			let output = fs.createWriteStream(tmpPath);
			// output.write('');
			let stream = byline(fs.createReadStream(path));
			let count = 0;
			stream.on('data', (line) => {
				let valueToken = line.toString().split(/\s+/);
				valueToken[+req.body.columnIndex + 1] = req.tmpData[count];
				output.write(_.join(valueToken, ' ') + '\n');
				count++;
			});
			stream.on('end', () => {
				fs.copy(tmpPath, path, err => {
					if (err) console.log(err);
					console.log("Edit array data done, remove tmp");
					output.close();
					if (fs.existsSync(tmpPath)) fs.unlink(tmpPath);
				});
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", curve));
			});
		});
	});
}

function splitArrayCurve(payload, done, dbConnection, username) {
	dbConnection.Curve.findByPk(payload.idCurve).then(curve => {
		let subfix = (payload.subfix || '_');
		if (curve || curve.type !== "ARRAY") {
			curveFunction.getFullCurveParents(curve, dbConnection).then(async c => {
				try {
					let curvePath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + c.project + c.well + c.dataset + c.curve, c.curve + '.txt');
					if (!mFs.existsSync(curvePath)) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error while reading data curve"));
					console.log("Split array curve : ", curvePath);
					let outputStreams = [];
					for (let i = 0; i < curve.dimension; i++) {
						if (payload.columnIndex && payload.columnIndex.includes(i) || !payload.columnIndex) {
							await dbConnection.Curve.findOrCreate({
								where: {
									name: curve.name + subfix + i,
									idDataset: curve.idDataset
								}, defaults: {
									name: curve.name + subfix + i,
									unit: payload.unit || curve.unit,
									description: "Splited from " + curve.name,
									type: "NUMBER",
									createdBy: curve.createdBy,
									updatedBy: curve.updatedBy,
									idDataset: curve.idDataset,
									idFamily: payload.idFamily || curve.idFamily
								}
							});
							let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + c.project + c.well + c.dataset + c.curve + subfix + i, c.curve + subfix + i + '.txt');
							console.log(path);
							outputStreams.push(mFs.createWriteStream(path, { flags: 'w' }));
						} else {
							outputStreams.push(false);
						}
					}
					let byLineSteam = byline(mFs.createReadStream(curvePath, { flags: 'r' }));
					byLineSteam.on('data', line => {
						line = line.toString();
						let depthToken = line.substr(0, line.indexOf(' '));
						let valueToken = line.substr(line.indexOf(' ') + 1);
						valueToken = valueToken.split(/\s+/);
						// console.log(outputStreams.length, valueToken.length);
						// console.log(depthToken, ":", valueToken);
						valueToken.forEach((value, index) => {
							if (outputStreams[index]) outputStreams[index].write(depthToken + ' ' + value + '\n');
						});
					});
					byLineSteam.on('end', () => {
						outputStreams.forEach(s => {
							if (s) s.close();
						});
						done(ResponseJSON(ErrorCodes.SUCCESS, "Done", c));
					});
					byLineSteam.on('error', e => {
						outputStreams.forEach(s => {
							if (s) s.close();
						});
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, e.message, e));
					});
				} catch (e) {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, e.message, e));
				}
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id or curve isn't an array curve"));
		}
	});
}

function mergeCurvesIntoArrayCurve(payload, done, dbConnection, username) {
	if (!payload.name) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need new curve name"));
	if (!payload.idDataset) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need idDataset"));
	if (!payload.idCurves || payload.idCurves.length === 0) return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Need idCurves"));
	let curves = [];
	let columnsTitle = [];
	dbConnection.Curve.create({
		name: payload.name,
		idDataset: payload.idDataset,
		dimension: payload.idCurves.length,
		type: "ARRAY",
		unit: payload.unit || '',
		idFamily: payload.idFamily || null,
		createdBy: payload.createdBy,
		updatedBy: payload.updatedBy
	}).then(newArrayCurve => {
		async.eachSeries(payload.idCurves, (idCurve, next) => {
			dbConnection.Curve.findByPk(idCurve).then(curve => {
				if (curve) {
					columnsTitle.push(curve.name);
					curve = curve.toJSON();
					curveFunction.getFullCurveParents(curve, dbConnection).then(c => {
						curve.path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + c.project + c.well + c.dataset + c.curve, c.curve + '.txt');
						curve.dataStream = mFs.createReadStream(curve.path);
						curve.parents = c;
						curves.push(curve);
						next();
					})
				} else {
					next();
				}
			});
		}, () => {
			_createDataTmp(curves, newArrayCurve.name, username).then(data => {
				console.log(data);
				newArrayCurve.columnsTitle = columnsTitle;
				newArrayCurve.save().then(() => {
					done(ResponseJSON(ErrorCodes.SUCCESS, "Done", newArrayCurve));
				}).catch(err => {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
					console.log(err);
				})
			}).catch(err => {
				console.log(err);
			})
		});
	}).catch(err => {
		if (err.name === "SequelizeUniqueConstraintError") {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve's name already exists"));
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
		}
	});
}

function _createDataTmp(curves, newCurveName, username) {
	return new Promise((resolve, reject) => {
		let arrayData = [];
		let initCurve = curves[0];
		if (!initCurve) done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed!", "No init curve"));
		let newArrayCurvePath = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + initCurve.parents.project + initCurve.parents.well + initCurve.parents.dataset + newCurveName, newCurveName + '.txt');
		let bylineStream = byline(initCurve.dataStream);
		bylineStream.on('data', line => {
			arrayData.push(line.toString().split(/\s+/));
		});
		bylineStream.on('end', () => {
			initCurve.dataStream.close();
			curves.splice(0, 1);
			async.eachSeries(curves, (curve, next) => {
				try {
					let count = 0;
					let bylineStream = byline(curve.dataStream);
					bylineStream.on('data', l => {
						if (arrayData[count]) arrayData[count].push((l.toString().split(/\s+/))[1]);
						count++;
					});
					bylineStream.on('end', () => {
						curve.dataStream.close();
						next();
					});
					bylineStream.on('error', () => {
						reject('byline stream error');
						curve.dataStream.close();
						next(n);
					});
				} catch (e) {
					console.log(e);
					next();
				}
			}, () => {
				let writeStream = mFs.createWriteStream(newArrayCurvePath, { flags: 'w' });
				arrayData.forEach(l => {
					writeStream.write(l.join(' ') + '\n');
				});
				writeStream.on('finish', () => {
					writeStream.close();
				});
				resolve(newArrayCurvePath);
			});
		});
		bylineStream.on('error', () => {
			reject('byline stream error');
			initCurve.dataStream.close();
		});
	});
}

function saveCurveData(payload, done, dbConnection, createdBy, updatedBy) {
	let idCurve = payload.body.idCurve || payload.body.idDesCurve;
	if (idCurve) {
		dbConnection.Curve.findByPk(idCurve).then(curve => {
			if (curve) {
				Object.assign(curve, payload.body).save().then(c => {
					curveFunction.getFullCurveParents(c, dbConnection).then(curveParent => {
						let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, payload.decoded.username + curveParent.project + curveParent.well + curveParent.dataset + curveParent.curve, curveParent.curve + '.txt');
						fs.copy(payload.file.path, path, function (err) {
							if (err) {
								console.log("ERR COPY FILE : ", err);
							}
							console.log("Copy file success for new raw curve!", path);
							done(ResponseJSON(ErrorCodes.SUCCESS, "Success", c));
						});
					});
				}).catch(err => {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
				})
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No curve found by id"));
			}
		});
	} else {
		dbConnection.Curve.create({
			name: payload.body.curveName,
			unit: payload.body.unit || '',
			type: payload.body.type,
			columnsTitle: payload.body.columnsTitle,
			createdBy: createdBy,
			updatedBy: updatedBy,
			dimension: payload.body.dimension || 1,
			idDataset: payload.body.idDataset,
			idFamily: payload.body.idFamily || null
		}).then(c => {
			curveFunction.getFullCurveParents(c, dbConnection).then(curveParent => {
				let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, payload.decoded.username + curveParent.project + curveParent.well + curveParent.dataset + curveParent.curve, curveParent.curve + '.txt');
				fs.copy(payload.file.path, path, function (err) {
					if (err) {
						console.log("ERR COPY FILE : ", err);
					}
					console.log("Copy file success for new raw curve!", path);
					done(ResponseJSON(ErrorCodes.SUCCESS, "Success", c));
				});
			});
		}).catch(err => {
			if (err.name === "SequelizeUniqueConstraintError") {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Curve's name already exists!"));
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			}
		});
	}
}

function getCurveList(payload, done, dbConnection) {
	dbConnection.Curve.findAll({
		where: { idDataset: payload.idDataset }
	}).then(curves => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", curves));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
	});
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
	mergeCurvesIntoArrayCurve: mergeCurvesIntoArrayCurve,
	saveCurveData: saveCurveData,
	getCurveList: getCurveList
};
