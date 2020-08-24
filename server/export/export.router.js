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
// const dlisExport = null;
const dlisExport = require('dlis_export')(config);
const checkPermisson = require('../utils/permission/check-permisison');
const archiver = require('archiver');
const curveModel = require('../curve/curve.model')
const curveUtils = require('../utils/curve.function');

function getFullProjectObj(idProject, idWell, dbConnection) {
    return new Promise(async resolve => {
        try {
            let project = await dbConnection.Project.findByPk(idProject);
            if (!project) resolve(null);
            project.wells = [];
            let well = await dbConnection.Well.findByPk(idWell, {
                include: [
                    { model: dbConnection.WellHeader },
                    { model: dbConnection.Dataset }
                ]
            });
            async.each(
                well.datasets,
                async (dataset, next) => {
                    dataset.curves = await dbConnection.Curve.findAll({
                        where: { idDataset: dataset.idDataset }
                    });
                    dataset.dataset_params = await dbConnection.DatasetParams.findAll({
                        where: { idDataset: dataset.idDataset }
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
                                if (idObj.datasets.length <= 0) {
                                    callback(null, [{ error: true, wellName: project.wells[0].name }])
                                }
                                else if (project && project.createdBy === req.decoded.username) {
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
                                }
                                else {
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
                                if (project) {
                                    console.log("dodv log: " + project.createdBy + "\t" + req.decoded.username);
                                } else {
                                    console.log("dodv log: there is no project");
                                }
                                if (idObj.datasets.length <= 0) {
                                    callback(null, { error: true, wellName: project.wells[0].name })
                                }
                                else if (project && project.createdBy === req.decoded.username) {
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
                            result.map(r => { if (r) r.ip = serverAddress });
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
                                if (idObj.datasets.length <= 0) {
                                    callback(null, [{ error: true, wellName: project.wells[0].name }])
                                }
                                else if (project && project.createdBy === req.decoded.username) {
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
                                if (idObj.datasets.length <= 0) {
                                    callback(null, { error: true, wellName: project.wells[0].name })
                                }
                                else if (project && project.createdBy === req.decoded.username) {
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
                            result.map(r => { if (r) r.ip = serverAddress });
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
    if (req.body.files && req.body.files.length == 1) {
        let filePath = path.join(
            process.env.BACKEND_EXPORT_PATH || config.exportPath,
            req.decoded.username,
            req.body.files[0]
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
                    res.contentType('application/octet-stream');
                    res.sendFile(filePath);
                }
            } else {
                res.send(ResponseJSON(404, 'ERROR File does not exist'));
            }
        });
    }
    else {
        const archive = archiver('zip');
        archive.on('error', function (err) {
            res.send(ResponseJSON(500, "Zipping err", err));
        });
        //res.attachment('I2G_export.zip');
        res.contentType('application/octet-stream');
        archive.pipe(res);
        for (const filename of req.body.files) {
            const filepath = path.join(
                process.env.BACKEND_EXPORT_PATH || config.exportPath,
                req.decoded.username,
                filename);
            archive.file(filepath, { name: filename })
        }
        archive.finalize();
    }

});

function compareFn(item1, item2) {
    if (item1[0] < item2[0]) return -1;
    if (item1[0] > item2[0]) return 1;
    //the same well
    if (parseFloat(item1[2]) < parseFloat(item2[2])) return -1;
    if (parseFloat(item1[2]) > parseFloat(item2[2])) return 1;
    return 0;
}

function getCurveDataPromise(idCurve, dbConnection, username) {
    return new Promise((resolve, reject) => {
        curveModel.getCurveInfo({ idCurve }, (result) => {
        }, dbConnection, username);
        curveModel.getData({ idCurve, isRaw: true }, function (resultStream) {
            if (resultStream) {
                let arrData = "";
                let lineReader = require('readline').createInterface({
                    input: resultStream
                });
                lineReader.on('line', function (line) {
                    arrData = arrData + line;
                });
                lineReader.on('close', function () {
                    let data = JSON.parse(arrData).content;
                    resolve(data);
                });
            }
        }, function (status) {
            reject(status);
        }, dbConnection, username);
    })
}

router.post('/zone-set', async function (req, res) {
    if (!req.body.idZoneSets) {
        res.send(
            ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, 'Missing zoneset id')
        );
    }
    let headers = ['Well', 'Zone', 'Top_Depth', 'Bottom_Depth'];
    let dbConnection = req.dbConnection;
    let username = req.decoded.username;
    const idZoneSets = req.body.idZoneSets;
    const _tvdInfos = req.body.tvdInfos || [];
    const _tvdssInfos = req.body.tvdssInfos || [];
    const tvdInfos = _tvdInfos.reduce((obj, cur, idx) => {
        obj[idZoneSets[idx]] = cur;
        return obj;
    }, {});
    const tvdssInfos = _tvdssInfos.reduce((obj, cur, idx) => {
        obj[idZoneSets[idx]] = cur;
        return obj;
    }, {});
    await new Promise((res, rej) => {
        async.each(tvdInfos,
            (tvdInfo, next) => {
                if (!tvdInfo) {
                    return next();
                }
                getCurveDataPromise(tvdInfo.idCurve, dbConnection, username).then(d => {
                    tvdInfo.data = d;
                    next();
                });
            },
            (err) => {
                if (err) rej(err);
                res();
            }
        );
    });
    await new Promise((res, rej) => {
        async.each(tvdssInfos,
            (tvdssInfo, next) => {
                if (!tvdssInfo) {
                    return next();
                }
                getCurveDataPromise(tvdssInfo.idCurve, dbConnection, username).then(d => {
                    tvdssInfo.data = d;
                    next();
                });
            },
            (err) => {
                if (err) rej(err);
                res();
            }
        );
    });
    let exportUnit = req.body.exportUnit;
    let arrData = [];
    await new Promise((res, rej) => {
        async.each(req.body.idZoneSets, (id, next) => {
            req.dbConnection.ZoneSet.findByPk(id, {
                include: [
                    {
                        model: req.dbConnection.Zone,
                        include: [{ model: req.dbConnection.ZoneTemplate }]
                    },
                    {
                        model: req.dbConnection.Well
                    }
                ]
            }).then(zoneSet => {
                if (!exportUnit) {
                    exportUnit = zoneSet.well.unit;
                }
                for (const zone of zoneSet.zones) {
                    let startDepth = parseFloat(zone.startDepth).toFixed(4);
                    let endDepth = parseFloat(zone.endDepth).toFixed(4);
                    let row = [
                        zoneSet.well.name,
                        zone.zone_template.name.replace(/,/g, ''),
                        convertLength.convertDistance(startDepth, 'm', exportUnit).toFixed(4),
                        convertLength.convertDistance(endDepth, 'm', exportUnit).toFixed(4),
                    ]
                    if (tvdInfos[id]) {
                        row.push(...getTVDValue(tvdInfos[id].data, tvdInfos[id], startDepth, endDepth).map(v => {
                            if (!v) return v;
                            return convertLength
                                .convertDistance(v, tvdInfos[id].unit, exportUnit)
                                .toFixed(4);
                        }));
                    }
                    if (tvdssInfos[id]) {
                        row.push(...getTVDValue(tvdssInfos[id].data, tvdssInfos[id], startDepth, endDepth).map(v => {
                            if (!v) return v;
                            return convertLength
                                .convertDistance(v, tvdssInfos[id].unit, exportUnit)
                                .toFixed(4);
                        }));
                    }
                    arrData.push(row);
                }
                next();
            });
        },
            (err) => {
                if (err) rej(err);
                res();
            }
        );
    });
    arrData.sort(compareFn);
    let unitArr = ['', '', exportUnit, exportUnit];
    if (Object.keys(tvdInfos).length)
        unitArr = [...unitArr, exportUnit, exportUnit];
    if (Object.keys(tvdssInfos).length)
        unitArr = [...unitArr, exportUnit, exportUnit];
    arrData.unshift(unitArr);
    if (Object.keys(tvdInfos).length)
        headers = [...headers, 'Top_TVD', 'Bottom_TVD'];
    if (Object.keys(tvdssInfos).length)
        headers = [...headers, 'Top_TVDSS', 'Bottom_TVDSS'];
    arrData.unshift(headers);
    csv
        .write(arrData)
        .pipe(res);

    function getTVDValue(curveData, tvdInfo, startDepth, endDepth) {
        startDepth = +(+startDepth).toFixed(4);
        endDepth = +(+endDepth).toFixed(4);
        let tvdStart = 0;
        let tvdEnd = 0;
        if (+tvdInfo.step) {
            tvdStart = curveData[Math.ceil((startDepth - +(tvdInfo.top).toFixed(4)) / +(tvdInfo.step).toFixed(4))];
            tvdEnd = curveData[Math.ceil((endDepth - +(tvdInfo.top).toFixed(4)) / +(tvdInfo.step).toFixed(4))];
        } else {
            const startIdx = curveData.findIndex(d => {
                return +(d.y).toFixed(4) > startDepth;
            });
            tvdStart = curveUtils.linearInterpolate(curveData[startIdx - 1], curveData[startIdx], startDepth);
            const endIdx = curveData.findIndex(d => {
                return +(d.y).toFixed(4) >= endDepth;
            });
            tvdEnd = curveUtils.linearInterpolate(curveData[endIdx - 1], curveData[endIdx], endDepth);
        }
        tvdStart = tvdStart ? +(tvdStart.x).toFixed(4) : null;
        tvdEnd = tvdEnd ? +(tvdEnd.x).toFixed(4) : null;
        return [tvdStart, tvdEnd];
    }
});

router.post('/marker-set', async function (req, res) {
    if (!req.body.idMarkerSets) {
        res.send(
            ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, 'Missing idMarkerSets')
        );
    }
    let headers = ['Well_name', 'Maker_name', 'Depth'];
    let dbConnection = req.dbConnection;
    let username = req.decoded.username;
    const idMarkerSets = req.body.idMarkerSets;
    const _tvdInfos = req.body.tvdInfos || [];
    const _tvdssInfos = req.body.tvdssInfos || [];
    const tvdInfos = _tvdInfos.reduce((obj, cur, idx) => {
        obj[idMarkerSets[idx]] = cur;
        return obj;
    }, {});
    const tvdssInfos = _tvdssInfos.reduce((obj, cur, idx) => {
        obj[idMarkerSets[idx]] = cur;
        return obj;
    }, {});
    await new Promise((res, rej) => {
        async.each(tvdInfos,
            (tvdInfo, next) => {
                if (!tvdInfo) {
                    return next();
                }
                getCurveDataPromise(tvdInfo.idCurve, dbConnection, username).then(d => {
                    tvdInfo.data = d;
                    next();
                });
            },
            (err) => {
                if (err) rej(err);
                res();
            }
        );
    });
    await new Promise((res, rej) => {
        async.each(tvdssInfos,
            (tvdssInfo, next) => {
                if (!tvdssInfo) {
                    return next();
                }
                getCurveDataPromise(tvdssInfo.idCurve, dbConnection, username).then(d => {
                    tvdssInfo.data = d;
                    next();
                });
            },
            (err) => {
                if (err) rej(err);
                res();
            }
        );
    });
    let exportUnit = req.body.exportUnit;
    let arrData = [];
    await new Promise((res, rej) => {
        async.each(req.body.idMarkerSets, (id, next) => {
            markersetIdx = req.body.idMarkerSets.indexOf(id);
            req.dbConnection.MarkerSet.findByPk(id, {
                include: [
                    {
                        model: req.dbConnection.Marker,
                        include: [{ model: req.dbConnection.MarkerTemplate }]
                    },
                    {
                        model: req.dbConnection.Well
                    }
                ]
            }).then(markerSet => {
                if (!exportUnit) {
                    exportUnit = markerSet.well.unit;
                }
                for (const marker of markerSet.markers) {
                    let depth = parseFloat(marker.depth).toFixed(4);
                    let row = [
                        markerSet.well.name,
                        marker.marker_template.name.replace(/,/g, ''),
                        convertLength.convertDistance(depth, 'm', exportUnit).toFixed(4)
                    ];
                    if (tvdInfos[id]) {
                        row.push(...getTVDValue(tvdInfos[id].data, tvdInfos[id], depth).map(v => {
                            if (!v) return v;
                            return convertLength
                                .convertDistance(v, tvdInfos[id].unit, exportUnit)
                                .toFixed(4);
                        }));
                    }
                    if (tvdssInfos[id]) {
                        row.push(...getTVDValue(tvdssInfos[id].data, tvdssInfos[id], depth).map(v => {
                            if (!v) return v;
                            return convertLength
                                .convertDistance(v, tvdssInfos[id].unit, exportUnit)
                                .toFixed(4);
                        }));
                    }
                    arrData.push(row);
                };
                next();
            });
        },
            (err) => {
                if (err) rej(err);
                res();
            }
        );
    });
    arrData.sort(compareFn);
    let unitArr = ['', '', exportUnit];
    if (Object.keys(tvdInfos).length)
        unitArr = [...unitArr, exportUnit];
    if (Object.keys(tvdssInfos).length)
        unitArr = [...unitArr, exportUnit];
    arrData.unshift(unitArr);
    if (Object.keys(tvdInfos).length)
        headers = [...headers, 'TVD'];
    if (Object.keys(tvdssInfos).length)
        headers = [...headers, 'TVDSS'];
    arrData.unshift(headers);
    csv
        .write(arrData)
        .pipe(res);

    function getTVDValue(curveData, tvdInfo, depth) {
        depth = +(+depth).toFixed(4);
        let tvd = 0;
        if (+tvdInfo.step) {
            tvd = curveData[Math.ceil((depth - +(tvdInfo.top).toFixed(4)) / +(tvdInfo.step).toFixed(4))];
        } else {
            const idx = curveData.findIndex(d => {
                return +(d.y).toFixed(4) > depth;
            });
            tvd = curveUtils.linearInterpolate(curveData[idx - 1], curveData[idx], depth);
        }
        tvd = tvd ? +(tvd.x).toFixed(4) : null;
        return [tvd];
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
                const fileName = Date.now() + "_I2GExport.dlis";
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
                        if (wellName.length <= 0) {
                            wellName = well.name;
                        } else {
                            wellName += '_' + well.name;
                        }
                        wells.push(well);
                    }
                }

                const exportDir = (process.env.BACKEND_EXPORT_PATH || config.exportPath) + '/' + req.decoded.username;
                if (!fs.existsSync(exportDir)) {
                    fs.mkdirSync(exportDir, { recursive: true });
                }
                await dlisExport.export(wells, exportDir + '/' + fileName, (curve) => fs.createReadStream(curve.path));
                results.push({
                    fileName: fileName,
                    wellName: wellName,
                    ip: serverAddress
                })

                res.send(ResponseJSON(200, 'SUCCESSFULLY', results));

            } catch (err) {
                console.log("==> " + err)
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

router.post('/rawcurves', async function (req, res) {
    /*
        req.body = {
            idCurves: [4, 5]
        }
    */
    const archive = archiver('zip');
    archive.on('error', function (err) {
        res.send(ResponseJSON(500, "Zipping err", err));
    });
    //res.attachment('I2G_export.zip');
    res.contentType('application/octet-stream');
    archive.pipe(res);

    const Curve = req.dbConnection.Curve;
    const Dataset = req.dbConnection.Dataset;
    const Well = req.dbConnection.Well;
    const Project = req.dbConnection.Project;
    const username = req.decoded.username;
    for (const curveID of req.body.idCurves) {
        const curve = await Curve.findByPk(curveID);
        const dataset = await Dataset.findByPk(curve.idDataset);
        const well = await Well.findByPk(dataset.idWell);
        const project = await Project.findByPk(well.idProject);
        let path = hashDir.createPath(process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name, curve.name + '.txt')
        console.log(path)
        archive.file(path, { name: curve.name + '.txt' })
        console.log("Hash : ", process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath, username + project.name + well.name + dataset.name + curve.name + '.txt');
    }
    archive.finalize()

})

router.post('/wellheader', function (req, res) {
    checkPermisson(req.updatedBy, 'project.import', async perm => {
        if (!perm) {
            return res.send(ResponseJSON(512, "Export: Do not have permission", "Export: Do not have permission"));
        }
        let exportAll = req.body.exportAll;
        let exportWells = req.body.wells || [];
        let dbConnection = req.dbConnection;
        let project = await dbConnection.Project.findByPk(req.body.idProject);
        if (!project) return res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Project not found"));
        let wells = null;
        if (exportAll) {
            wells = await dbConnection.Well.findAll({ where: { idProject: project.idProject } });
        } else {
            let wellIds = exportWells.map(w => w.idWell);
            wells = await dbConnection.Well
                .findAll({
                    where: {
                        idProject: project.idProject,
                        idWell: {
                            [Op.in]: wellIds
                        }
                    }
                });
        }
        if (!wells || !wells.length) return res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Well not found"));
        let listParamHeader = ['Well Name'];
        let listWell = [];
        async.eachSeries(wells, function (well, next) {
            dbConnection.WellHeader.findAll({ where: { idWell: well.idWell } }).then(headers => {
                headers.forEach(h => {
                    if (!listParamHeader.includes(h.header)) {
                        listParamHeader.push(h.header);
                    }
                })
                listWell.push({ well, headers });
                next();
            });
        }, function (err) {
            if (err) {
                return res.send(ResponseJSON(512, err));
            }
            let dataExport = listWell.map(() => []);
            listParamHeader.forEach(param => {
                listWell.forEach((well, index) => {
                    if (param === 'Well Name') {
                        dataExport[index].push(well.well.name);
                    } else {
                        let data = null;
                        for (let w of well.headers) {
                            if (w.header === param) {
                                data = w.value;
                                break;
                            }
                        }
                        dataExport[index].push(data);
                    }
                })
            })
            csv
                .write([listParamHeader, ...dataExport])
                .pipe(res)
            // res.send(new ResponseJSON(200, "Success", {listParamHeader, listWell, values}))
        })
    })
})
module.exports = router;
