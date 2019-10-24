const fs = require('fs');
const curveFunction = require('../utils/curve.function');
const async = require('async');

function createTempfile(data, callback) {
	let tempfile = require('tempfile')('.json');
	fs.writeFileSync(tempfile, JSON.stringify(data));
	callback(200, tempfile);
}

function getFullImageParents(imageset, dbConnection) {
	return new Promise((resolve => {
		dbConnection.ImageSet.findByPk(imageset.idImageSet).then(ims => {
			if (ims) {
				dbConnection.Well.findByPk(ims.idWell).then(well => {
					resolve({
						name: ims.name,
						well: well.name
					});
				})
			} else {
				resolve(null);
			}
		});
	}))
}

function getFullZoneParents(zoneset, dbConnection) {
	return new Promise((resolve => {
		dbConnection.ZoneSet.findByPk(zoneset.idZoneSet).then(zs => {
			if (zs) {
				dbConnection.Well.findByPk(zs.idWell).then(well => {
					resolve({
						name: zs.name,
						well: well.name
					});
				});
			} else {
				console.log("No zone set found ", zoneset);
				resolve(null);
			}
		}).catch(err => {
			console.log(err);
			resolve(null);
		});
	}));
}

function getFullMarkerSetParents(markerSet, dbConnection) {
	return new Promise((resolve => {
		dbConnection.MarkerSet.findByPk(markerSet.idMarkerSet).then(ms => {
			if (ms) {
				dbConnection.Well.findByPk(ms.idWell).then(well => {
					resolve({
						name: ms.name,
						well: well.name
					});
				});
			} else {
				console.log("No zone set found ", markerSet);
				resolve(null);
			}
		}).catch(err => {
			console.log(err);
			resolve(null);
		});
	}));
}

module.exports = function (body, done, error, dbConnection, username) {
	dbConnection.Plot.findByPk(body.idPlot, {
		include: [
			{
				model: dbConnection.Track, include: [
					{model: dbConnection.Line},
					{model: dbConnection.Shading},
					{model: dbConnection.Annotation}
				]
			},
			{model: dbConnection.DepthAxis},
			{model: dbConnection.ImageTrack, include: {model: dbConnection.ImageSet}},
			{model: dbConnection.ObjectTrack, include: {model: dbConnection.ObjectOfTrack}},
			{model: dbConnection.ZoneTrack, include: {model: dbConnection.ZoneSet}}
		]
	}).then(plot => {
		if (!plot) throw "Not existed!";
		plot = plot.toJSON();
		let newEportPlot = {
			name: plot.name,
			option: plot.option,
			// cropDisplay: plot.cropDisplay,
			printSetting: plot.printSetting,
			unit: plot.unit,
			depthRefSpec: plot.depthRefSpec,
			notShowPatterns: plot.notShowPatterns,
			separationWidth: plot.separationWidth,
			separationUnit: plot.separationUnit
		};
		let newExportTracks = [];
		let newExportDeptAxes = [];
		let newExportImageTracks = [];
		let newExportZoneTracks = [];
		async.series([
			function (cb) {
				curveFunction.getFullCurveParents({idCurve: plot.referenceCurve}, dbConnection).then(refCurve => {
					newEportPlot.reference_curve = refCurve;
					async.each(plot.tracks, function (track, nextTrack) {
						let newTrack = {
							lines: [],
							shadings: [],
							annotations: [],
							zone_set: null,
							marker_set: null,
							orderNum: track.orderNum,
							showTitle: track.showTitle,
							title: track.title,
							topJustification: track.topJustification,
							bottomJustification: track.bottomJustification,
							showLabels: track.showLabels,
							majorTicks: track.majorTicks,
							minorTicks: track.minorTicks,
							showDepthGrid: track.showDepthGrid,
							width: track.width,
							widthUnit: track.widthUnit,
							color: track.color,
							showEndLabels: track.showEndLabels,
							labelFormat: track.labelFormat,
							zoomFactor: track.zoomFactor,
							zoneAboveCurve: track.zoneAboveCurve,
							zoneOpacity: track.zoneOpacity,
							trackOffset: track.trackOffset,
							showValueGrid: track.showValueGrid,
							limitingSpec: track.limitingSpec,
							showMarkerName: track.showMarkerName,
							showMarkerDepth: track.showMarkerDepth
						};
						getFullZoneParents({idZoneSet: track.idZoneSet}, dbConnection).then(zone_set => {
							newTrack.zone_set = zone_set;
							getFullMarkerSetParents({idMarkerSet: track.idMarkerSet}, dbConnection).then(marker_set => {
								newTrack.marker_set = marker_set;
								async.each(track.lines, function (line, nextLine) {
									let newLine = {};
									curveFunction.getFullCurveParents({idCurve: line.idCurve}, dbConnection).then(curveFullParents => {
										Object.assign(newLine, line);
										if (body.nameMappingOptions) newLine.taskCurve = body.nameMappingOptions[line.idLine];
										delete newLine.idLine;
										delete newLine.idTrack;
										delete newLine.idCurve;
										newLine.curve = curveFullParents;
										newTrack.lines.push(newLine);
										nextLine();
									});
								}, function () {
									async.each(track.shadings, function (shading, nextShading) {
										let newShading = {};
										curveFunction.getFullCurveParents({idCurve: shading.idControlCurve}, dbConnection).then(async control_curve => {
											let left_curve, right_curve;
											let left_line = await dbConnection.Line.findByPk(shading.idLeftLine);
											let right_line = await dbConnection.Line.findByPk(shading.idRightLine);
											if (left_line) {
												left_curve = await curveFunction.getFullCurveParents({idCurve: left_line.idCurve}, dbConnection);
											}
											if (right_line) {
												right_curve = await curveFunction.getFullCurveParents({idCurve: right_line.idCurve}, dbConnection);
											}
											newShading.name = shading.name;
											newShading.leftFixedValue = shading.leftFixedValue;
											newShading.rightFixedValue = shading.rightFixValue;
											newShading.fill = shading.fill;
											newShading.negativeFill = shading.negativeFill;
											newShading.positiveFill = shading.positiveFill;
											newShading.isNegPosFill = shading.isNegPosFill;
											newShading.orderNum = shading.orderNum;
											newShading.controle_curve = control_curve;
											newShading.left_line = left_line ? {
												alias: left_line.alias,
												left_curve: left_curve
											} : null;
											newShading.right_line = right_line ? {
												alias: right_line.alias,
												right_curve: right_curve
											} : null;
											newTrack.shadings.push(newShading);
											nextShading();
										});
									}, function () {
										async.each(track.annotations, (annotation, nextAnno) => {
											newTrack.annotations.push({
												textStyle: annotation.textStyle,
												text: annotation.text,
												vAlign: annotation.vAlign,
												hAlign: annotation.hAlign,
												background: annotation.background,
												fitBounds: annotation.fitBounds,
												deviceSpace: annotation.deviceSpace,
												vertical: annotation.vertical,
												shadow: annotation.shadow,
												left: annotation.left,
												width: annotation.width,
												top: annotation.top,
												bottom: annotation.bottom
											});
											nextAnno();
										}, () => {
											newExportTracks.push(newTrack);
											nextTrack();
										});
									});
								});
							});
						});
					}, function () {
						newEportPlot.tracks = newExportTracks;
						cb();
					});
				});
			},
			function (cb) {
				async.each(plot.depth_axes, (depth_axis, nextDepth) => {
					let newDepthAxis = {};
					curveFunction.getFullCurveParents({idCurve: depth_axis.idCurve}, dbConnection).then(async curve => {
						let well;
						if (depth_axis.idWell) well = await dbConnection.Well.findByPk(depth_axis.idWell);
						newDepthAxis.curve = curve;
						newDepthAxis.well = well ? {name: well.name} : {};
						newDepthAxis.showTitle = depth_axis.showTitle;
						newDepthAxis.title = depth_axis.title;
						newDepthAxis.justification = depth_axis.justification;
						newDepthAxis.depthType = depth_axis.depthType;
						newDepthAxis.unitType = depth_axis.unitType;
						newDepthAxis.decimals = depth_axis.decimals;
						newDepthAxis.trackBackground = depth_axis.trackBackground;
						newDepthAxis.geometryWidth = depth_axis.geometryWidth;
						newDepthAxis.orderNum = depth_axis.orderNum;
						newDepthAxis.width = depth_axis.width;
						newDepthAxis.widthUnit = depth_axis.widthUnit;
						newDepthAxis.trackOffset = depth_axis.trackOffset;
						newDepthAxis.tickMode = depth_axis.tickMode;
						newDepthAxis.majorTickLength = depth_axis.majorTickLength;
						newDepthAxis.minorTickNum = depth_axis.minorTickNum;
						newDepthAxis.limitingSpec = depth_axis.limitingSpec;
						newExportDeptAxes.push(newDepthAxis);
						nextDepth();
					})
				}, () => {
					newEportPlot.depth_axes = newExportDeptAxes;
					cb();
				});
			},
			function (cb) {
				async.each(plot.image_tracks, (image_track, nextImageTrack) => {
					getFullImageParents(image_track.image_set, dbConnection).then(image_set => {
						newExportImageTracks.push({
							showTitle: image_track.showTitle,
							title: image_track.title,
							topJustification: image_track.topJustification,
							orderNum: image_track.orderNum,
							background: image_track.background,
							width: image_track.width,
							widthUnit: image_track.widthUnit,
							zoomFactor: image_track.zoomFactor,
							trackOffset: image_track.trackOffset,
							image_set: image_set,
							limitingSpec: image_track.limitingSpec
						});
						nextImageTrack();
					});
				}, () => {
					newEportPlot.image_tracks = newExportImageTracks;
					cb();
				});
			},
			function (cb) {
				async.each(plot.zone_tracks, (zone_track, next) => {
					getFullZoneParents({idZoneSet: zone_track.idZoneSet}, dbConnection).then(zoneset => {
						newExportZoneTracks.push({
							showTitle: zone_track.showTitle,
							title: zone_track.title,
							topJustification: zone_track.topJustification,
							bottomJustification: zone_track.bottomJustification,
							orderNum: zone_track.orderNum,
							color: zone_track.color,
							width: zone_track.width,
							widthUnit: zone_track.widthUnit,
							zoomFactor: zone_track.zoomFactor,
							trackOffset: zone_track.trackOffset,
							limitingSpec: zone_track.limitingSpec,
							zone_set: zoneset
						});
						next();
					});
				}, () => {
					newEportPlot.zone_tracks = newExportZoneTracks;
					cb();
				});
			}
		], () => {
			createTempfile(newEportPlot, done);
			// dbConnection.ParameterSet.create({
			// 	name: "template-" + newEportPlot.name + "-" + Date.now(),
			// 	content: newEportPlot,
			// 	type: "PT",
			// 	idProject: 1,
			// 	createdBy: "hoang",
			// 	updatedBy: "hoang"
			// });
			// createTempfile(plot, done);
		});
	}).catch(err => {
		console.log(err);
		error(404);
	});
};
