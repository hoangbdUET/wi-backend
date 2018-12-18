let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncEach = require('async/each');
let eachSeries = require('async/eachSeries');

function createNewZoneSet(zoneSetInfo, done, dbConnection) {
	let ZoneSet = dbConnection.ZoneSet;
	ZoneSet.create(zoneSetInfo).then(zs => {
		if (zoneSetInfo.idZoneSetTemplate && (zoneSetInfo.start || zoneSetInfo.start === 0) && zoneSetInfo.stop) {
			let Op = require('sequelize').Op;
			dbConnection.ZoneTemplate.findAll({
				where: {idZoneSetTemplate: zoneSetInfo.idZoneSetTemplate},
				order: [['orderNum', 'ASC']]
			}).then(async (zones) => {
				let stop = zoneSetInfo.stop;
				let start = zoneSetInfo.start;
				let range = (stop - start) / zones.length;
				eachSeries(zones, function (zone, nextZone) {
					dbConnection.Zone.create({
						idZoneSet: zs.idZoneSet,
						startDepth: start,
						endDepth: start + range,
						name: zone.name,
						createdBy: zoneSetInfo.createdBy,
						updatedBy: zoneSetInfo.updatedBy,
						idZoneTemplate: zone.idZoneTemplate,
						orderNum: zone.orderNum
					}).then(z => {
						start = start + range;
						nextZone();
					}).catch(err => {
						console.log(err);
						nextZone();
					})
				}, function () {
					dbConnection.ZoneSet.findById(zs.idZoneSet, {
						include: [{model: dbConnection.ZoneSetTemplate}, {
							model: dbConnection.Zone,
							include: {model: dbConnection.ZoneTemplate}
						}]
					}).then(rs => {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ZoneSet success", rs));
					});
				});
			});
		} else {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ZoneSet success", zs));
		}
	}).catch(err => {
		if (err.name === "SequelizeUniqueConstraintError") {
			dbConnection.ZoneSet.findOne({
				where: {name: zoneSetInfo.name, idWell: zoneSetInfo.idWell},
				include: {model: dbConnection.ZoneSetTemplate}
			}).then(zs => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Zone set's name already exists", zs));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
		}
	});
}

function editZoneSet(zoneSetInfo, done, dbConnection) {
	delete zoneSetInfo.createdBy;
	let ZoneSet = dbConnection.ZoneSet;
	ZoneSet.findById(zoneSetInfo.idZoneSet)
		.then(function (zoneSet) {
			zoneSet = Object.assign(zoneSet, zoneSetInfo);
			zoneSet.save()
				.then(function () {
					dbConnection.ZoneSet.findById(zoneSetInfo.idZoneSet, {
						include: [{model: dbConnection.ZoneSetTemplate}, {
							model: dbConnection.Zone,
							include: {model: dbConnection.ZoneTemplate}
						}]
					}).then(rs => {
						done(ResponseJSON(ErrorCodes.SUCCESS, "Edit zoneSet success", rs));
					});
				})
				.catch(function (err) {
					if (err.name === "SequelizeUniqueConstraintError") {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Zone set's name already exists"));
					} else {
						done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
					}
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for edit"))
		});
}

function deleteZoneSet(zoneSetInfo, done, dbConnection) {
	let ZoneSet = dbConnection.ZoneSet;
	ZoneSet.findById(zoneSetInfo.idZoneSet)
		.then(function (zoneSet) {
			zoneSet.setDataValue('updatedBy', zoneSetInfo.updatedBy);
			zoneSet.destroy({permanently: true, force: true})
				.then(function () {
					done(ResponseJSON(ErrorCodes.SUCCESS, "ZoneSet is deleted", zoneSet));
				})
				.catch(function (err) {
					done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete ZoneSet " + err.message, err.message));
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for delete"));
		})
}

function getZoneSetInfo(zoneSet, done, dbConnection) {
	let ZoneSet = dbConnection.ZoneSet;
	ZoneSet.findById(zoneSet.idZoneSet, {
		include: {
			model: dbConnection.Zone,
			include: {
				model: dbConnection.ZoneTemplate
			}
		}
	})
		.then(function (zoneSet) {
			if (!zoneSet) throw "not exits";
			done(ResponseJSON(ErrorCodes.SUCCESS, "Get info ZoneSet success", zoneSet));
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "ZoneSet not found for get info"));
		})
}

function getZoneSetList(setInfo, done, dbConnection) {
	let ZoneSet = dbConnection.ZoneSet;
	if (setInfo.idProject) {
		let response = [];
		dbConnection.Well.findAll({where: {idProject: setInfo.idProject}}).then(wells => {
			asyncEach(wells, function (well, next) {
				dbConnection.ZoneSet.findAll({
					where: {idWell: well.idWell},
					include: [{model: dbConnection.ZoneSetTemplate}, {
						model: dbConnection.Zone,
						include: dbConnection.ZoneTemplate
					}]
				}).then(zss => {
					asyncEach(zss, function (zs, nextzs) {
						response.push(zs);
						nextzs();
					}, function () {
						next();
					})
				});
			}, function () {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", response));
			})
		})
	} else {
		ZoneSet.findAll({
			where: {idWell: setInfo.idWell},
			include: [{model: dbConnection.ZoneSetTemplate}, {
				model: dbConnection.Zone,
				include: dbConnection.ZoneTemplate
			}]
		})
			.then(function (zoneSetList) {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Get list zoneset success", zoneSetList));
			})
			.catch(function () {
				done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "get zone-set list error"));
			});
	}
}

async function duplicateZoneSet(data, done, dbConnection) {
	let zoneset = await dbConnection.ZoneSet.findById(data.idZoneSet, {include: {all: true}});
	let newZoneset = zoneset.toJSON();
	delete newZoneset.idZoneSet;
	newZoneset.name = zoneset.name + '_COPY_' + zoneset.duplicated;
	zoneset.duplicated++;
	newZoneset.createdBy = data.createdBy;
	newZoneset.updatedBy = data.updatedBy;
	await zoneset.save();
	let _zoneset = await dbConnection.ZoneSet.create(newZoneset);
	asyncEach(newZoneset.zones, function (zone, next) {
		delete zone.idZone;
		zone.idZoneSet = _zoneset.idZoneSet;
		dbConnection.Zone.create(zone).then(() => {
			next();
		}).catch(err => {
			next();
		});
	}, function (err) {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", _zoneset));
	});
}

module.exports = {
	createNewZoneSet: createNewZoneSet,
	deleteZoneSet: deleteZoneSet,
	editZoneSet: editZoneSet,
	getZoneSetInfo: getZoneSetInfo,
	getZoneSetList: getZoneSetList,
	duplicateZoneSet: duplicateZoneSet
};

