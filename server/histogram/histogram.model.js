"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncLoop = require('async/each');
const logMessage = require('../log-message');
let findFamilyIdByName = function (familyName, dbConnection, callback) {
	dbConnection.Family.findOne({
		where: {name: familyName},
		// include: {model: dbConnection.FamilySpec, as: 'family_spec', where: {isDefault: true}}
		include: {model: dbConnection.FamilySpec, as: 'family_spec'}
	}).then(family => {
		if (family) {
			let familyObj = family.toJSON();
			familyObj.blockPosition = familyObj.family_spec[0].blockPosition;
			familyObj.displayMode = familyObj.family_spec[0].displayMode;
			familyObj.displayType = familyObj.family_spec[0].displayType;
			familyObj.lineColor = familyObj.family_spec[0].lineColor;
			familyObj.lineStyle = familyObj.family_spec[0].lineStyle;
			familyObj.lineWidth = familyObj.family_spec[0].lineWidth;
			familyObj.maxScale = familyObj.family_spec[0].maxScale;
			familyObj.minScale = familyObj.family_spec[0].minScale;
			familyObj.unit = familyObj.family_spec[0].unit;
			delete familyObj.family_spec;
			callback(familyObj);
		} else {
			callback(null);
		}
	}).catch((err) => {
		console.log(err);
		callback(null);
	})
};

function createNewHistogram(histogramInfo, done, dbConnection, logger) {
	let curves = histogramInfo.curves ? histogramInfo.curves : [];
	if (histogramInfo.histogramTemplate && histogramInfo.datasets) {
		console.log("NEW HISTOGRAM TEMPLATE ", histogramInfo.histogramTemplate);
		let myData = null;
		let loga = false;
		try {
			myData = require('./histogram-template/' + histogramInfo.histogramTemplate + '.json');
		} catch (err) {
			return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogarm template found"));
		}
		if (histogramInfo.histogramTemplate === "ShadowResistivity" || histogramInfo.histogramTemplate === "DeepResistivity") {
			loga = true;
		}
		histogramInfo.name = histogramInfo.name || myData.name;
		histogramInfo.loga = loga;
		dbConnection.Histogram.create(histogramInfo).then(async histogram => {
			let curves = [];
			asyncLoop(histogramInfo.datasets, function (idDataset, nextDataset) {
				asyncLoop(myData.families, function (family, nextFamily) {
					findFamilyIdByName(family.name, dbConnection, function (family) {
						if (family) {
							dbConnection.Curve.findOne({
								where: {
									idDataset: idDataset,
									idFamily: family.idFamily
								}
							}).then(foundCurve => {
								if (foundCurve) {
									nextFamily(foundCurve);
								} else {
									nextFamily();
								}
							});
						} else {
							nextFamily();
						}
					})
				}, function (found) {
					if (found) curves.push(found.idCurve);
					nextDataset();
				});
			}, function () {
				histogram.setCurves(curves).then(() => {
					logger.info(logMessage("HISTOGRAM", histogram.idHistogram, "Created"));
					done(ResponseJSON(ErrorCodes.SUCCESS, "Done", histogram));
				});
			});
		}).catch(err => {
			if (err.name === "SequelizeUniqueConstraintError") {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram's name already exists"));
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			}
		});
	} else {
		dbConnection.Histogram.create(histogramInfo).then(async histogram => {
			await histogram.setCurves(curves);
			dbConnection.Histogram.findByPk(histogram.idHistogram, {include: {all: true}}).then(h => {
				logger.info(logMessage("HISTOGRAM", h.idHistogram, "Created"));
				done(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", h));
			});
		}).catch(err => {
			if (err.name === "SequelizeUniqueConstraintError") {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram's name already exists"));
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			}
		});
	}
}


function createNewHistogram_(histogramInfo, done, dbConnection) {
	let Histogram = dbConnection.Histogram;
	let Well = dbConnection.Well;
	Well.findByPk(parseInt(histogramInfo.idWell)).then(well => {
		let myData;
		if (histogramInfo.histogramTemplate) {
			console.log("NEW HISTOGRAM TEMPLATE ", histogramInfo.histogramTemplate);
			myData = null;
			let loga = false;
			try {
				myData = require('./histogram-template/' + histogramInfo.histogramTemplate + '.json');
			} catch (err) {
				return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogarm template found"));
			}
			myData.name = histogramInfo.name ? histogramInfo.name : myData.name;
			if (histogramInfo.histogramTemplate === "ShadowResistivity" || histogramInfo.histogramTemplate === "DeepResistivity") {
				loga = true;
			}
			Histogram.create({
				name: myData.name,
				idWell: histogramInfo.idWell,
				intervalDepthTop: histogramInfo.intervalDepthTop,
				intervalDepthBottom: histogramInfo.intervalDepthBottom,
				loga: loga,
				colorBy: histogramInfo.colorBy,
				createdBy: histogramInfo.createdBy,
				updatedBy: histogramInfo.updatedBy
			}).then(histogram => {
				// let idHistogram = histogram.idHistogram;
				asyncLoop(myData.families, function (family, next) {
					findFamilyIdByName(family.name, dbConnection, function (family) {
						if (family) {
							dbConnection.Dataset.findAll({where: {idWell: histogramInfo.idWell}}).then(datasets => {
								asyncLoop(datasets, function (dataset, next) {
									// next();
									dbConnection.Curve.findOne({
										where: {
											idFamily: family.idFamily,
											idDataset: dataset.idDataset
										}
									}).then(curve => {
										if (curve) {
											curve.leftScale = family.minScale;
											curve.rightScale = family.maxScale;
											curve.color = family.lineColor;
											next(curve);
										} else {
											next();
										}
									}).catch(err => {
										console.log(err);
									});
								}, function (found) {
									if (found) {
										next(found);
									} else {
										next();
									}
								});
							});

						} else {
							next();
						}
					});
				}, function (curve) {
					if (curve) {
						dbConnection.Histogram.update({
							idCurve: curve.idCurve,
							leftScale: curve.leftScale,
							rightScale: curve.rightScale,
							color: curve.color
						}, {
							where: {
								idHistogram: histogram.idHistogram
							}
						}).then(rs => {
							Histogram.findByPk(histogram.idHistogram).then(his => {
								his = his.toJSON();
								his.noCurveFound = false;
								return done(ResponseJSON(ErrorCodes.SUCCESS, "Done with curve", his));
							});
						}).catch(err => {
							console.log(err.message);
						})
					} else {
						Histogram.findByPk(histogram.idHistogram).then(his => {
							his = his.toJSON();
							his.noCurveFound = true;
							done(ResponseJSON(ErrorCodes.SUCCESS, "NO_CURVE_FOUND", his));
						});
					}
				});
			}).catch(err => {
				console.log(err.message);
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram's name already exists", err.message));
			})
		} else {
			if (histogramInfo.idZoneSet) {
				Histogram.create(histogramInfo).then(result => {
					Histogram.findByPk(result.idHistogram).then(his => {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
					});
				}).catch(err => {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram's name already exists", err.message));
				});
			} else {
				Histogram.create(histogramInfo).then(result => {
					Histogram.findByPk(result.idHistogram).then(his => {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Create new histogram success", his));
					});
				}).catch(err => {
					// console.log(err);
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram's name already exists", err.errors));
				});
			}

		}
	});

}

function getHistogram(histogramId, done, dbConnection) {
	let Histogram = dbConnection.Histogram;
	let Curve = dbConnection.Curve;
	let ZoneSet = dbConnection.ZoneSet;
	let Zone = dbConnection.Zone;
	let ReferenceCurve = dbConnection.ReferenceCurve;
	let Discrim = dbConnection.Discrim;
	Histogram.findByPk(histogramId.idHistogram, {
		include: [{
			model: ZoneSet,
			include: [{model: Zone}]
		}, {
			model: Curve
		}, {
			model: ReferenceCurve,
			include: [{model: Curve}]
		}]
	}).then(rs => {
		if (rs) {
			Curve.findByPk(rs.idCurve).then(curve => {
				let response = rs.toJSON();
				if (curve) {
					asyncLoop(response.reference_curves, function (ref, next) {
						Curve.findByPk(ref.idCurve).then(curve => {
							if (curve) {
								next();
							} else {
								ref.idCurve = null;
								next();
							}
						});
					}, function () {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
					});
				} else {
					response.idCurve = null;
					asyncLoop(response.reference_curves, function (ref, next) {
						Curve.findByPk(ref.idCurve).then(curve => {
							if (curve) {
								next();
							} else {
								ref.idCurve = null;
								next();
							}
						});
					}, function () {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
					});
					// done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", response));
				}
			}).catch(err => {
				console.log(err);
				done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram not exists"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
	})
}

function editHistogram(histogramInfo, done, dbConnection, logger) {
	let curves = histogramInfo.curves ? histogramInfo.curves : [];
	delete histogramInfo.createdBy;
	let Histogram = dbConnection.Histogram;
	Histogram.findByPk(histogramInfo.idHistogram)
		.then(function (histogram) {
			let isRename = histogramInfo.name && histogram.name !== histogramInfo.name;
			histogramInfo.discriminator = JSON.stringify(histogramInfo.discriminator);
			Object.assign(histogram, histogramInfo)
				.save()
				.then(async function (result) {
					if (!isRename) {
						await result.setCurves(curves);
					}
					logger.info(logMessage("HISTOGRAM", result.idHistogram, "Updated"));
					done(ResponseJSON(ErrorCodes.SUCCESS, "Edit histogram success", result));
				})
				.catch(function (err) {
					if (err.name === "SequelizeUniqueConstraintError") {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Histogram's name already exists"));
					} else {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
					}
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "histogram not found for edit"));
		})
}

function deleteHistogram(histogramInfo, done, dbConnection, logger) {
	let Histogram = dbConnection.Histogram;
	Histogram.findByPk(histogramInfo.idHistogram)
		.then(function (histogram) {
			histogram.setDataValue('updatedBy', histogramInfo.updatedBy);
			histogram.destroy({permanently: true, force: true})
				.then(function () {
					logger.info(logMessage("HISTOGRAM", histogram.idHistogram, "Deleted"));
					done(ResponseJSON(ErrorCodes.SUCCESS, "Histogram is deleted", histogram));
				})
				.catch(function (err) {
					done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Histogram " + err.message, err.message));
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Histogram not found for delete"))
		})
}

function duplicateHistogram(payload, done, dbConnection, logger) {
	let Histogram = dbConnection.Histogram;
	Histogram.findByPk(payload.idHistogram, {include: {all: true}}).then(histogram => {
		let newHistogram;
		if (histogram) {
			newHistogram = histogram.toJSON();
			delete newHistogram.idHistogram;
			delete newHistogram.createdAt;
			delete newHistogram.updatedAt;
			newHistogram.duplicated = 1;
			newHistogram.name = newHistogram.name + "_COPY_" + histogram.duplicated;
			newHistogram.createdBy = payload.createdBy;
			newHistogram.updatedBy = payload.updatedBy;
			histogram.duplicated++;
			let curves = histogram.curves.map(c => c.idCurve);
			histogram.save();
			Histogram.create(newHistogram).then(rs => {
				asyncLoop(histogram.curves, function (curve) {
					rs.addCurve(curve).then(c => {
						let curve_set = c[0][0];
						curve_set.intervalDepthTop = curve.histogram_curve_set.intervalDepthTop;
						curve_set.intervalDepthBottom = curve.histogram_curve_set.intervalDepthBottom;
						curve_set.showGaussian = curve.histogram_curve_set.showGaussian;
						curve_set.showCumulative = curve.histogram_curve_set.showCumulative;
						curve_set.lineStyle = curve.histogram_curve_set.lineStyle;
						curve_set.lineColor = curve.histogram_curve_set.lineColor;
						curve_set.plot = curve.histogram_curve_set.plot;
						curve_set.color = curve.histogram_curve_set.color;
						curve_set.save();
					})
				});
				// rs.setCurves(histogram.curves).then(r => {
				//     console.log(r);
				// });
				logger.info(logMessage("HISTOGRAM", histogram.idHistogram, "Duplicated"));
				done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", histogram));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogram found"));
		}
	});
}

function editHistogramCurveSet(payload, done, dbConnection) {
	dbConnection.HistogramCurveSet.findByPk(payload.idHistogramCurveSet).then(hcs => {
		if (hcs) {
			Object.assign(hcs, payload).save().then(h => {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", h));
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err.message));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No histogram curve set found"));
		}
	});
}

module.exports = {
	createNewHistogram: createNewHistogram,
	getHistogram: getHistogram,
	editHistogram: editHistogram,
	deleteHistogram: deleteHistogram,
	duplicateHistogram: duplicateHistogram,
	editHistogramCurveSet: editHistogramCurveSet
};
