let express = require('express');
let router = express.Router();
let async = require('async');
let path = require('path');
let fs = require('fs');
let config = require('config');
let ResponseJSON = require('../response');
let exporter = require('wi-export-test');
const csv = require('fast-csv');
const ErrorCodes = require('../../error-codes').CODES;
let convertLength = require('../utils/convert-length');
const serverAddress = require('../utils/information').serverAddress;
const hashDir = require('../utils/data-tool').hashDir;
const Op = require('sequelize').Op;
const dlisExport = require('dlis_export')(config);
const checkPermisson = require('../utils/permission/check-permisison');

function getFullProjectObj(idProject, idWell, dbConnection) {
	return new Promise(async resolve => {
		try {
			let project = await dbConnection.Project.findByPk(idProject);
			if (!project) resolve(null);
			project.wells = [];
			let well = await dbConnection.Well.findByPk(idWell, {
				include: [
					{model: dbConnection.WellHeader},
					{model: dbConnection.Dataset}
				]
			});
			async.each(
				well.datasets,
				async (dataset, next) => {
					dataset.curves = await dbConnection.Curve.findAll({
						where: {idDataset: dataset.idDataset}
					});
					dataset.dataset_params = await dbConnection.DatasetParams.findAll({
						where: {idDataset: dataset.idDataset}
					});
					next();
				},
				() => {
					project.wells.push(well);
					resolve(project);
				}
			);
		} catch (e) {
			console.log(e);
			resolve(null);
		}
	});
}

router.post('/las2', function (req, res) {
	checkPermisson(req.updatedBy, 'project.import', perm => {
		if (!perm) {
			res.send(ResponseJSON(512, "Export: Do not have permission", "Export: Do not have permission"));
		} else {
			let token =
				req.body.token ||
				req.query.token ||
				req.header['x-access-token'] ||
				req.get('Authorization');
			exporter.setUnitTable(convertLength.getUnitTable(), function () {
				async.map(
					req.body.idObjs,
					function (idObj, callback) {
						getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(
							project => {
								if (project && project.createdBy === req.decoded.username) {
									exporter.exportLas2FromProject(
										project,
										idObj.datasets,
										process.env.BACKEND_EXPORT_PATH || config.exportPath,
										process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath,
										req.decoded.username,
										function (err, result) {
											console.log('exportLas2 callback called');
											if (err) {
												callback(err, null);
											} else {
												callback(null, result);
											}
										}
									);
								} else {
									callback(null, null);
								}
							}
						);
					},
					function (err, results) {
						// console.log('callback called');
						if (err) {
							res.send(ResponseJSON(512, err));
						} else {
							let responseArr = [];
							async.each(
								results,
								function (rs, next) {
									async.each(
										rs,
										function (r, _next) {
											r.ip = serverAddress;
											responseArr.push(r);
											_next();
										},
										function (err) {
											next();
										}
									);
								},
								function (err) {
									if (err) {
										res.send(ResponseJSON(512, err));
									} else {
										res.send(ResponseJSON(200, 'SUCCESSFULLY', responseArr));
									}
								}
							);
						}
					}
				);
			});
		}
	});
});
router.post('/las3', function (req, res) {
	checkPermisson(req.updatedBy, 'project.import', perm => {
		if (!perm) {
			res.send(ResponseJSON(512, "Export: Do not have permission", "Export: Do not have permission"));
		} else {
			let token =
				req.body.token ||
				req.query.token ||
				req.header['x-access-token'] ||
				req.get('Authorization');
			exporter.setUnitTable(convertLength.getUnitTable(), function () {
				async.map(
					req.body.idObjs,
					function (idObj, callback) {
						getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(
							project => {
								if (project && project.createdBy === req.decoded.username) {
									exporter.exportLas3FromProject(
										project,
										idObj.datasets,
										process.env.BACKEND_EXPORT_PATH || config.exportPath,
										process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath,
										req.decoded.username,
										function (err, result) {
											if (err) {
												callback(err, null);
											} else if (result) {
												callback(null, result);
											} else {
												callback(null, null);
											}
										}
									);
								} else {
									callback(null, null);
								}
							}
						);
					},
					function (err, result) {
						if (err) {
							res.send(ResponseJSON(404, err));
						} else {
							result.map(r => (r.ip = serverAddress));
							res.send(ResponseJSON(200, 'SUCCESSFULLY', result));
						}
					}
				);
			});
		}
	});
});

router.post('/CSV/rv', function (req, res) {
	checkPermisson(req.updatedBy, 'project.import', perm => {
		if (!perm) {
			res.send(ResponseJSON(512, "Export: Do not have permission", "Export: Do not have permission"));
		} else {
			let token =
				req.body.token ||
				req.query.token ||
				req.header['x-access-token'] ||
				req.get('Authorization');
			exporter.setUnitTable(convertLength.getUnitTable(), function () {
				async.map(
					req.body.idObjs,
					function (idObj, callback) {
						getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(
							project => {
								if (project && project.createdBy === req.decoded.username) {
									exporter.exportCsvRVFromProject(
										project,
										idObj.datasets,
										process.env.BACKEND_EXPORT_PATH || config.exportPath,
										process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath,
										req.decoded.username,
										function (err, result) {
											if (err) {
												callback(err, null);
											} else {
												callback(null, result);
											}
										}
									);
								} else {
									callback(null, null);
								}
							}
						);
					},
					function (err, results) {
						// console.log('callback called');
						if (err) {
							res.send(ResponseJSON(512, err));
						} else {
							let responseArr = [];
							async.each(
								results,
								function (rs, next) {
									async.each(
										rs,
										function (r, _next) {
											responseArr.push(r);
											_next();
										},
										function (err) {
											next();
										}
									);
								},
								function (err) {
									if (err) {
										res.send(ResponseJSON(512, err));
									} else {
										responseArr.map(r => (r.ip = serverAddress));
										res.send(ResponseJSON(200, 'SUCCESSFULLY', responseArr));
									}
								}
							);
						}
					}
				);
			});
		}
	});
});
router.post('/CSV/wdrv', function (req, res) {
	checkPermisson(req.updatedBy, 'project.import', perm => {
		if (!perm) {
			res.send(ResponseJSON(512, "Export: Do not have permission", "Export: Do not have permission"));
		} else {
			let token =
				req.body.token ||
				req.query.token ||
				req.header['x-access-token'] ||
				req.get('Authorization');
			exporter.setUnitTable(convertLength.getUnitTable(), function () {
				async.map(
					req.body.idObjs,
					function (idObj, callback) {
						getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(
							project => {
								if (project && project.createdBy === req.decoded.username) {
									exporter.exportCsvWDRVFromProject(
										project,
										idObj.datasets,
										process.env.BACKEND_EXPORT_PATH || config.exportPath,
										process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath,
										req.decoded.username,
										function (err, result) {
											if (err) {
												callback(err, null);
											} else if (result) {
												callback(null, result);
											} else {
												callback(null, null);
											}
										}
									);
								} else {
									callback(null, null);
								}
							}
						);
					},
					function (err, result) {
						if (err) {
							res.send(ResponseJSON(404, err));
						} else {
							result.map(r => (r.ip = serverAddress));
							res.send(ResponseJSON(200, 'SUCCESSFULLY', result));
						}
					}
				);
			});
		}
	});
});

function getFilesizeInBytes(filename) {
	const stats = fs.statSync(filename);
	const fileSizeInBytes = stats.size;
	return fileSizeInBytes;
}

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

router.post('/files', function (req, res) {
	let filePath = path.join(
		process.env.BACKEND_EXPORT_PATH || config.exportPath,
		req.decoded.username,
		req.body.fileName
	);
	// console.log(filePath)
	fs.exists(filePath, async function (exists) {
		if (exists) {
			const currentSize = getFilesizeInBytes(filePath);
			// console.log('Current size : ', currentSize);
			await sleep(4000);
			const newSize = getFilesizeInBytes(filePath);
			// console.log('New size : ', newSize);
			if (currentSize !== newSize) {
				res.send(
					ResponseJSON(
						512,
						'Your file is currently processing',
						'Your file is currently processing'
					)
				);
			} else {
				res.sendFile(filePath);
			}
		} else {
			res.send(ResponseJSON(404, 'ERROR File does not exist'));
		}
	});
});

function compareFn(item1, item2) {
	if (item1[0] < item2[0]) return -1;
	if (item1[0] > item2[0]) return 1;
	//the same well
	if (parseFloat(item1[2]) < parseFloat(item2[2])) return -1;
	if (parseFloat(item1[2]) > parseFloat(item2[2])) return 1;
	return 0;
}

router.post('/zone-set', async function (req, res) {
	if (req.body.idZoneSets) {
		let exportUnit = req.body.exportUnit;
		let arrData = [];
		for (const id of req.body.idZoneSets) {
			const zoneSet = await req.dbConnection.ZoneSet.findByPk(id, {
				include: [
					{
						model: req.dbConnection.Zone,
						include: [{model: req.dbConnection.ZoneTemplate}]
					},
					{
						model: req.dbConnection.Well
					}
				]
			});
			if (!exportUnit) {
				exportUnit = zoneSet.well.unit;
			}
			if (exportUnit != 'm' && exportUnit != 'M') {
				zoneSet.zones.forEach(zone => {
					arrData.push([
						zoneSet.well.name,
						zone.zone_template.name.replace(/,/g, ''),
						convertLength
							.convertDistance(zone.startDepth, 'm', exportUnit)
							.toFixed(4),
						convertLength
							.convertDistance(zone.endDepth, 'm', exportUnit)
							.toFixed(4)
					]);
				});
			} else {
				zoneSet.zones.forEach(zone => {
					arrData.push([
						zoneSet.well.name,
						zone.zone_template.name.replace(/,/g, ''),
						parseFloat(zone.startDepth).toFixed(4),
						parseFloat(zone.endDepth).toFixed(4)
					]);
				});
			}
		}
		arrData.sort(compareFn);
		// console.log(arrData);
		arrData.unshift(['', '', exportUnit, exportUnit]);
		arrData.unshift(['', '', '', '']); //??????????????
		console.log(exportUnit, '\n', arrData);
		csv
			.write(arrData, {headers: ['Well', 'Zone', 'Top_Depth', 'Bottom_Depth']})
			.pipe(res);
	} else {
		res.send(
			ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, 'Missing zoneset id')
		);
	}
});

router.post('/marker-set', async function (req, res) {
	if (req.body.idMarkerSets) {
		let arrData = [];
		// let exportUnit = null;
		let exportUnit = req.body.exportUnit;
		for (const id of req.body.idMarkerSets) {
			const markerSet = await req.dbConnection.MarkerSet.findByPk(id, {
				include: [
					{
						model: req.dbConnection.Marker,
						include: [{model: req.dbConnection.MarkerTemplate}]
					},
					{
						model: req.dbConnection.Well
					}
				]
			});
			if (!exportUnit) {
				exportUnit = markerSet.well.unit;
			}
			if (exportUnit != 'm' && exportUnit != 'M') {
				// console.log("convert unit of depth");
				markerSet.markers.forEach(marker => {
					arrData.push([
						markerSet.well.name,
						marker.marker_template.name.replace(/,/g, ''),
						convertLength
							.convertDistance(parseFloat(marker.depth), 'm', exportUnit)
							.toFixed(4)
					]);
				});
			} else {
				markerSet.markers.forEach(marker => {
					arrData.push([
						markerSet.well.name,
						marker.marker_template.name.replace(/,/g, ''),
						parseFloat(marker.depth).toFixed(4)
					]);
				});
			}
		}
		// console.log(arrData);
		arrData.sort(compareFn);
		arrData.unshift(['', '', exportUnit]);
		arrData.unshift(['', '', '']);
		csv
			.write(arrData, {headers: ['Well_name', 'Maker_name', 'Depth']})
			.pipe(res);
	} else {
		res.send(
			ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, 'Missing idMarkerSets')
		);
	}
});

router.post('/dlisv1', async function (req, res) {
	checkPermisson(req.updatedBy, 'project.import', async perm => {
		if (!perm) {
			res.send(ResponseJSON(512, "Export: Do not have permission", "Export: Do not have permission"));
		} else {
			try {
				const results = [];
				const wells = [];
				let fileName = Date.now();
				let wellName = '';
				const username = req.decoded.username;

				for (const obj of req.body.idObjs) {
					const datasetIDs = [];
					let curveIDs = [];
					for (const dataset of obj.datasets) {
						datasetIDs.push(dataset.idDataset)
						curveIDs = curveIDs.concat(dataset.idCurves)
					}

					let project = await
						req.dbConnection.Project.findByPk(obj.idProject, {
							include: [{
								model: req.dbConnection.Well,
								where: {
									idWell: obj.idWell
								},
								include: [{
									model: req.dbConnection.WellHeader
								},
									{
										model: req.dbConnection.Dataset,
										where: {
											idDataset: {
												[Op.in]: datasetIDs
											}
										},
										include: {
											model: req.dbConnection.Curve,
											where: {
												idCurve: {
													[Op.in]: curveIDs
												},
												name: {
													[Op.ne]: "__MD"
												}
											}
										}
									}]
							}]
						})

					project = project.toJSON();
					for (const well of project.wells) {
						for (const dataset of well.datasets) {
							for (const curve of dataset.curves) {
								curve.path = (process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath) + '/' +
									hashDir.getHashPath(username + project.name + well.name + dataset.name + curve.name) + curve.name + '.txt';
							}
						}
						fileName += '_' + well.name;
						if (wellName.length <= 0) {
							wellName = well.name;
						} else {
							wellName += '_' + well.name;
						}
						wells.push(well);
					}
				}

				const exportDir = (process.env.BACKEND_EXPORT_PATH || config.exportPath) + '/' + req.decoded.username;
				fileName += '.dlis';
				if (!fs.existsSync(exportDir)) {
					fs.mkdirSync(exportDir, {recursive: true});
				}
				await dlisExport.export(wells, exportDir + '/' + fileName);
				results.push({
					fileName: fileName,
					wellName: wellName,
					ip: serverAddress
				})

				res.send(ResponseJSON(200, 'SUCCESSFULLY', results));

			} catch (err) {
				// console.log(err)
				res.send(ResponseJSON(404, err));
			}
		}
	});
})

router.post('/clear', function (req, res) {
	try {
		const dir = (process.env.BACKEND_EXPORT_PATH || config.exportPath) + '/' + req.decoded.username;
		fs.readdir(dir, (err, files) => {
			if (err) throw err;

			for (const file of files) {
				fs.unlink(path.join(dir, file), err => {
					if (err) throw err;
				});
			}
		});
	} catch (err) {
		console.log(err);
	}
	res.send(ResponseJSON(200, 'SUCCESSFULLY'));
})
module.exports = router;
