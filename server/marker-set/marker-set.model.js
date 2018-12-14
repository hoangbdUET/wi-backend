const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
const async = require('async');

function createNew(payload, done, dbConnection) {
	if (payload.idMarkerSetTemplate) {
		dbConnection.MarkerSet.create(payload).then(markerSet => {
			let Op = require('sequelize').Op;
			if (payload.idMarkerSetTemplate && (payload.start || payload.start === 0) && payload.stop) {
				dbConnection.MarkerTemplate.findAll({
					where: {idMarkerSetTemplate: payload.idMarkerSetTemplate},
					order: [['orderNum', 'ASC']]
				}).then(async templates => {
					let stop = payload.stop;
					let start = payload.start;
					let range = (stop - start) / templates.length;
					async.eachSeries(templates, function (tp, next) {
						dbConnection.Marker.create({
							depth: start,
							idMarkerTemplate: tp.idMarkerTemplate,
							idMarkerSet: markerSet.idMarkerSet,
							updatedBy: payload.updatedBy,
							createdBy: payload.createdBy
						}).then(() => {
							start = start + range;
							next();
						}).catch(err => {
							console.log(err);
							next();
						});
					}, function () {
						dbConnection.MarkerSet.findById(markerSet.idMarkerSet, {
							include: [{model: dbConnection.MarkerSetTemplate}, {
								model: dbConnection.Marker,
								include: {model: dbConnection.MarkerTemplate}
							}]
						}).then(rs => {
							done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
						});
					})
				});
			} else {
				done(ResponseJSON(ErrorCodes.SUCCESS, "Done", markerSet));
			}
		}).catch(err => {
			if (err.name === "SequelizeUniqueConstraintError") {
				dbConnection.MarkerSet.findOne({
					where: {name: payload.name, idWell: payload.idWell},
					include: {model: dbConnection.MarkerSetTemplate}
				}).then(zs => {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Marker set's name already exists", zs));
				});
			} else {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
			}
		})
	} else {
		dbConnection.MarkerSet.create(payload).then(m => {
			done(ResponseJSON(ErrorCodes.SUCCESS, "Done", m));
		}).catch(err => {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
		});
	}
}

function edit(payload, done, dbConnection) {
	dbConnection.MarkerSet.findById(payload.idMarkerSet).then(m => {
		if (m) {
			Object.assign(m, payload).save().then(r => {
				dbConnection.MarkerSet.findById(r.idMarkerSet, {
					include: [{model: dbConnection.MarkerSetTemplate}, {
						model: dbConnection.Marker,
						include: {model: dbConnection.MarkerTemplate}
					}]
				}).then(rs => {
					done(ResponseJSON(ErrorCodes.SUCCESS, "Done", rs));
				});
			}).catch(err => {
				done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
			});
		} else {
			done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No marker found by id"));
		}
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function del(payload, done, dbConnection) {
	dbConnection.MarkerSet.destroy({where: {idMarkerSet: payload.idMarkerSet}}).then(r => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done"));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function list(payload, done, dbConnection) {
	dbConnection.MarkerSet.findAll({
		where: {idWell: payload.idWell},
		include: [{model: dbConnection.MarkerSetTemplate}, {
			model: dbConnection.Marker,
			include: {model: dbConnection.MarkerTemplate}
		}]
	}).then(r => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

function info(payload, done, dbConnection) {
	dbConnection.MarkerSet.findById(payload.idMarkerSet, {
		include: {
			model: dbConnection.Marker,
			include: {model: dbConnection.MarkerTemplate}
		}
	}).then(r => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Done", r));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
	});
}

module.exports = {
	createNewMarkerSet: createNew,
	editMarkerSet: edit,
	deleteMarkerSet: del,
	listMarkerSet: list,
	infoMarkerSet: info
};
