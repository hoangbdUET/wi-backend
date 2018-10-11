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

router.post('/las2', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    exporter.setUnitTable(convertLength.getUnitTable(), function () {
        async.map(req.body.idObjs, function (idObj, callback) {
            req.dbConnection.Project.findById(idObj.idProject, {
                include: [{
                    model: req.dbConnection.Well,
                    include: [{
                        model: req.dbConnection.WellHeader
                    }, {
                        model: req.dbConnection.Dataset,
                        include: {
                            model: req.dbConnection.Curve
                        }
                    }],
                    where: {
                        idWell: idObj.idWell
                    }
                }],
            }).then(project => {
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
            req.dbConnection.Project.findById(idObj.idProject, {
                include: [{
                    model: req.dbConnection.Well,
                    include: [{
                        model: req.dbConnection.WellHeader
                    }, {
                        model: req.dbConnection.Dataset,
                        include: {
                            model: req.dbConnection.Curve
                        }
                    }],
                    where: {
                        idWell: idObj.idWell
                    }
                }],
            }).then(project => {
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
            req.dbConnection.Project.findById(idObj.idProject, {
                include: [{
                    model: req.dbConnection.Well,
                    include: [{
                        model: req.dbConnection.WellHeader
                    }, {
                        model: req.dbConnection.Dataset,
                        include: {
                            model: req.dbConnection.Curve
                        }
                    }],
                    where: {
                        idWell: idObj.idWell
                    }
                }],
            }).then(project => {
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
            req.dbConnection.Project.findById(idObj.idProject, {
                include: [{
                    model: req.dbConnection.Well,
                    include: [{
                        model: req.dbConnection.WellHeader
                    }, {
                        model: req.dbConnection.Dataset,
                        include: {
                            model: req.dbConnection.Curve
                        }
                    }],
                    where: {
                        idWell: idObj.idWell
                    }
                }],
            }).then(project => {
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

router.post('/files', function (req, res) {
    let filePath = path.join(config.exportPath, req.decoded.username, req.body.fileName);
    fs.exists(filePath, function (exists) {
        if (exists) {
            res.sendFile(filePath);
        } else {
            res.send(ResponseJSON(404, "ERROR File does not exist"));
        }
    });
})

router.post('/zone-set', async function (req, res) {
    if(req.body.idZoneSets) {
        let zonesets = [];
        const csvStream = csv.createWriteStream({headers: ['Well name', 'Zone name', 'Top depth', 'Bottom depth', 'Unit']});

        csvStream.pipe(res);

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
            for (const zone of zoneSet.zones){
                const line = [zoneSet.well.name, zone.zone_template.name, zone.startDepth, zone.endDepth, zoneSet.well.unit]
                csvStream.write(line);
            }
            zonesets.push(zoneSet);
        }

        csvStream.end();
    }else {
        res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Missing zoneset id"));
    }
})

module.exports = router;