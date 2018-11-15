const express = require('express');
const router = express.Router();
const async = require('async');
const dbMaster = require('../models-master');

router.post('/migrate/clone-zone-set-template', async (req, res) => {
    let dbConnection = req.dbConnection;
    let projects = await dbConnection.Project.findAll();
    let zoneSetTemplates = await dbConnection.ZoneSetTemplate.findAll({
        include: {model: dbConnection.ZoneTemplate}
    });
    async.each(projects, (project, nextProject) => {
        async.each(zoneSetTemplates, (zoneSetTemplate, nextZst) => {
            dbConnection.ZoneSetTemplate.create({
                name: zoneSetTemplate.name,
                idProject: project.idProject
            }).then(zst => {
                async.each(zoneSetTemplate.zone_templates, (zs, nextZ) => {
                    dbConnection.ZoneTemplate.create({
                        name: zs.name,
                        background: zs.background,
                        foreground: zs.foreground,
                        pattern: zs.pattern,
                        orderNum: zs.orderNum,
                        idZoneSetTemplate: zst.idZoneSetTemplate
                    }).then(() => {
                        nextZ();
                    }).catch(err => {
                        console.log(err);
                        nextZ();
                    });
                }, function () {
                    nextZst();
                });
            }).catch(err => {
                console.log(err);
                nextZst();
            });
        }, function () {
            nextProject();
        });
    }, function () {
        res.json(zoneSetTemplates);
    });
});

router.post('/migrate/clone-marker-set-template', async (req, res) => {
    let dbConnection = req.dbConnection;
    let projects = await dbConnection.Project.findAll();
    let markerSetTemplates = await dbConnection.MarkerSetTemplate.findAll({
        include: {model: dbConnection.MarkerTemplate}
    });
    async.each(projects, (project, nextProject) => {
        async.each(markerSetTemplates, (markerSetTemplate, nextZst) => {
            dbConnection.MarkerSetTemplate.create({
                name: markerSetTemplate.name,
                idProject: project.idProject
            }).then(zst => {
                async.each(markerSetTemplate.marker_templates, (zs, nextZ) => {
                    dbConnection.MarkerTemplate.create({
                        name: zs.name,
                        color: zs.color,
                        lineStyle: zs.lineStyle,
                        lineWidth: zs.lineWidth,
                        orderNum: zs.orderNum,
                        idMarkerSetTemplate: zst.idMarkerSetTemplate
                    }).then(() => {
                        nextZ();
                    }).catch(err => {
                        console.log(err);
                        nextZ();
                    });
                }, function () {
                    nextZst();
                });
            }).catch(err => {
                console.log(err);
                nextZst();
            });
        }, function () {
            nextProject();
        });
    }, function () {
        res.json(markerSetTemplates);
    });
});

router.post('/migrate/update-zone-set', async (req, res) => {
    let dbConnection = req.dbConnection;
    let zonesets = await dbConnection.ZoneSet.findAll({
        include: {
            model: dbConnection.Zone,
            include: {model: dbConnection.ZoneTemplate}
        }
    });
    async.each(zonesets, function (zoneset, next) {
        getIdProjectByIdWell(zoneset.idWell, dbConnection).then(idProject => {
            console.log("++++++", idProject);
            dbConnection.ZoneSetTemplate.findById(zoneset.idZoneSetTemplate).then(zst => {
                console.log("------", zst.name);
                dbConnection.ZoneSetTemplate.findOne({where: {idProject: idProject, name: zst.name}}).then(_zst => {
                    console.log("=======", _zst.idZoneSetTemplate);
                    if (_zst.idZoneSetTemplate) {
                        zoneset.idZoneSetTemplate = _zst.idZoneSetTemplate;
                        zoneset.save().then(() => {
                            async.each(zoneset.zones, (zone, nextZ) => {
                                dbConnection.ZoneTemplate.findOne({
                                    where: {
                                        name: zone.zone_template.name,
                                        idZoneSetTemplate: _zst.idZoneSetTemplate
                                    }
                                }).then(_zoneTemplate => {
                                    if (_zoneTemplate && _zoneTemplate.idZoneTemplate) {
                                        console.log("??????", _zoneTemplate.idZoneTemplate);
                                        zone.idZoneTemplate = _zoneTemplate.idZoneTemplate;
                                        zone.save().then(() => {
                                            nextZ();
                                        });
                                    } else {
                                        nextZ();
                                    }
                                });
                            }, function () {
                                next();
                            });
                        });
                    } else {
                        next();
                    }
                });
            });
        });
    }, function () {
        res.json(zonesets);
    });
});

router.post('/migrate/update-marker-set', async (req, res) => {
    let dbConnection = req.dbConnection;
    let markersets = await dbConnection.MarkerSet.findAll({
        include: {
            model: dbConnection.Marker,
            include: {model: dbConnection.MarkerTemplate}
        }
    });
    async.each(markersets, function (markerset, next) {
        getIdProjectByIdWell(markerset.idWell, dbConnection).then(idProject => {
            console.log("++++++", idProject);
            dbConnection.MarkerSetTemplate.findById(markerset.idMarkerSetTemplate).then(zst => {
                console.log("------", zst.name);
                dbConnection.MarkerSetTemplate.findOne({where: {idProject: idProject, name: zst.name}}).then(_zst => {
                    console.log("=======", _zst.idMarkerSetTemplate);
                    if (_zst.idMarkerSetTemplate) {
                        markerset.idMarkerSetTemplate = _zst.idMarkerSetTemplate;
                        markerset.save().then(() => {
                            async.each(markerset.markers, (marker, nextZ) => {
                                dbConnection.MarkerTemplate.findOne({
                                    where: {
                                        name: marker.marker_template.name,
                                        idMarkerSetTemplate: _zst.idMarkerSetTemplate
                                    }
                                }).then(_zoneTemplate => {
                                    if (_zoneTemplate && _zoneTemplate.idMarkerTemplate) {
                                        console.log("??????", _zoneTemplate.idMarkerTemplate);
                                        marker.idMarkerTemplate = _zoneTemplate.idMarkerTemplate;
                                        marker.save().then(() => {
                                            nextZ();
                                        });
                                    } else {
                                        nextZ();
                                    }
                                });
                            }, function () {
                                next();
                            });
                        });
                    } else {
                        next();
                    }
                });
            });
        });
    }, function () {
        res.json(markersets);
    });
});

async function getIdProjectByIdWell(idWell, dbConnection) {
    let well = await dbConnection.Well.findById(idWell);
    if (well) return well.idProject;
    return null;
}

router.post('/migrate/task-spec', async (req, res) => {
    const dbConnection = req.dbConnection;
    dbMaster.TaskSpec.findAll().then((master_tps) => {
        async.each(master_tps, (master_tp, next) => {
            dbConnection.TaskSpec.findById(master_tp.idTaskSpec).then(ts => {
                ts.content = master_tp.content;
                ts.save().then(() => {
                    next();
                });
            });
        }, function () {
            res.json(req.decoded.username + " Done");
        });
    });
});

module.exports = router;