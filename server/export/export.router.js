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
let convertLength = require('../utils/convert-length')

function getFullProjectObj(idProject, idWell, dbConnection) {
    return new Promise(async (resolve) => {
        try {
            let project = await dbConnection.Project.findById(idProject);
            if (!project) resolve(null);
            project.wells = [];
            let well = await dbConnection.Well.findById(idWell, {include: [{model: dbConnection.WellHeader}, {model: dbConnection.Dataset}]});
            async.each(well.datasets, async (dataset, next) => {
                dataset.curves = await dbConnection.Curve.findAll({where: {idDataset: dataset.idDataset}});
                dataset.dataset_params = await dbConnection.DatasetParams.findAll({where: {idDataset: dataset.idDataset}});
                next();
            }, () => {
                project.wells.push(well);
                resolve(project);
            });
        } catch (e) {
            console.log(e);
            resolve(null);
        }
    })
}

router.post('/las2', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    exporter.setUnitTable(convertLength.getUnitTable(), function () {
        async.map(req.body.idObjs, function (idObj, callback) {
            getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(project => {
                if (project && project.createdBy === req.decoded.username) {

                    exporter.exportLas2FromProject(project, idObj.datasets, config.exportPath, config.curveBasePath, req.decoded.username, function (err, result) {
                        console.log('exportLas2 callback called');
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, result);
                        }
                    })
                } else {
                    callback(null, null);
                }
            })
        }, function (err, results) {
            console.log('callback called');
            if (err) {
                res.send(ResponseJSON(512, err));
            } else {
                let responseArr = [];
                async.each(results, function (rs, next) {
                    async.each(rs, function (r, _next) {
                        responseArr.push(r);
                        _next();
                    }, function (err) {
                        next();
                    })
                }, function (err) {
                    if (err) {
                        res.send(ResponseJSON(512, err));
                    } else {
                        res.send(ResponseJSON(200, 'SUCCESSFULLY', responseArr));
                    }
                })
            }
        });
    })
})
router.post('/las3', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    exporter.setUnitTable(convertLength.getUnitTable(), function () {
        async.map(req.body.idObjs, function (idObj, callback) {
            getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(project => {
                if (project && project.createdBy === req.decoded.username) {
                    exporter.exportLas3FromProject(project, idObj.datasets, config.exportPath, config.curveBasePath, req.decoded.username, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else if (result) {
                            callback(null, result);
                        } else {
                            callback(null, null)
                        }
                    })
                } else {
                    callback(null, null);
                }
            })
        }, function (err, result) {
            if (err) {
                res.send(ResponseJSON(404, err));
            } else {
                res.send(ResponseJSON(200, 'SUCCESSFULLY', result));
            }
        });
    });
})

router.post('/CSV/rv', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    exporter.setUnitTable(convertLength.getUnitTable(), function () {
        async.map(req.body.idObjs, function (idObj, callback) {
            getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(project => {
                if (project && project.createdBy === req.decoded.username) {
                    exporter.exportCsvRVFromProject(project, idObj.datasets, config.exportPath, config.curveBasePath, req.decoded.username, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, result);
                        }
                    })
                } else {
                    callback(null, null);
                }
            })
        }, function (err, results) {
            console.log('callback called');
            if (err) {
                res.send(ResponseJSON(512, err));
            } else {
                let responseArr = [];
                async.each(results, function (rs, next) {
                    async.each(rs, function (r, _next) {
                        responseArr.push(r);
                        _next();
                    }, function (err) {
                        next();
                    })
                }, function (err) {
                    if (err) {
                        res.send(ResponseJSON(512, err));
                    } else {
                        res.send(ResponseJSON(200, 'SUCCESSFULLY', responseArr));
                    }
                })
            }
        });
    });
})
router.post('/CSV/wdrv', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    exporter.setUnitTable(convertLength.getUnitTable(), function () {
        async.map(req.body.idObjs, function (idObj, callback) {
            getFullProjectObj(idObj.idProject, idObj.idWell, req.dbConnection).then(project => {
                if (project && project.createdBy === req.decoded.username) {
                    exporter.exportCsvWDRVFromProject(project, idObj.datasets, config.exportPath, config.curveBasePath, req.decoded.username, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else if (result) {
                            callback(null, result);
                        } else {
                            callback(null, null)
                        }
                    })
                } else {
                    callback(null, null);
                }
            })
        }, function (err, result) {
            if (err) {
                res.send(ResponseJSON(404, err));
            } else {
                res.send(ResponseJSON(200, 'SUCCESSFULLY', result));
            }
        });
    });
})

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

router.post('/files', function (req, res) {
    let filePath = path.join(config.exportPath, req.decoded.username, req.body.fileName);
    fs.exists(filePath, async function (exists) {
        if (exists) {
            const currentSize = getFilesizeInBytes(filePath);
            console.log("Current size : ", currentSize);
            await sleep(4000);
            const newSize = getFilesizeInBytes(filePath);
            console.log("New size : ", newSize);
            if (currentSize !== newSize) {
                res.send(ResponseJSON(512, "Your file is currently processing", "Your file is currently processing"));
            } else {
                res.sendFile(filePath);
            }
        } else {
            res.send(ResponseJSON(404, "ERROR File does not exist"));
        }
    });
});

router.post('/zone-set', async function (req, res) {
    if (req.body.idZoneSets) {
        let arrData = [['', '', '', '', '']]; //??????????????
        for (const id of req.body.idZoneSets) {
            const zoneSet = await req.dbConnection.ZoneSet.findById(id, {
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
            zoneSet.zones.forEach(zone => {
                arrData.push([zoneSet.well.name, zone.zone_template.name, zone.startDepth, zone.endDepth, zoneSet.well.unit]);
            });
        }
        csv.write(arrData, {headers: ['Well', 'Zone', 'Top_Depth', 'Bottom_Depth', 'Unit']}).pipe(res);
    } else {
        res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Missing zoneset id"));
    }
});

router.post('/marker-set', async function (req, res) {
    if(req.body.idMarkerSets){
        let arrData = [['', '', '']];
        let unit = null;
        for (const id of req.body.idMarkerSets) {
            const markerSet = await req.dbConnection.MarkerSet.findById(id, {
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
            if(!unit){
                unit = markerSet.well.unit;
                arrData.push(['', '', unit]);
            }
            if(markerSet.well.unit != unit){
                //convert unit of depth
                markerSet.markers.forEach(marker => {
                    arrData.push([markerSet.well.name, marker.marker_template.name, convertLength.convertDistance( marker.depth, markerSet.well.unit, unit)]);
                });
            } else {
                markerSet.markers.forEach(marker => {
                    arrData.push([markerSet.well.name, marker.marker_template.name, marker.depth]);
                });
            }
        }
        csv.write(arrData, {headers: ['Well_name', 'Maker_name', 'Depth']}).pipe(res);
    }
    else {
        res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Missing idMarkerSets"));
    }
})

module.exports = router;