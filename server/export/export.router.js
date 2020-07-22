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
    let headers = ['Well', 'Zone', 'Top_Depth', 'Bottom_Depth'];
    let dbConnection = req.dbConnection;
    let username = req.decoded.username;
    let tvdInfos = req.body.tvdInfos || [];
    let tvdssInfos = req.body.tvdssInfos || [];
    let tvdDatas = {};
    let tvdssDatas = {};
    if (tvdInfos && tvdInfos.length) {
        await new Promise((res, rej) => {
            async.eachOf(tvdInfos,
                (tvdInfo, i, next) => {
                    if (!tvdInfo) {
                        tvdDatas[i] = null;
                        return next();
                    }
                    getCurveDataPromise(tvdInfo.idCurve, dbConnection, username).then(d => {
                        tvdDatas[i] = d;
                        next();
                    });
                },
                (err) => {
                    if (err) rej(err);
                    res();
                }
            );
        });
    }
    if (tvdssInfos && tvdssInfos.length) {
        await new Promise((res, rej) => {
            async.eachOf(tvdssInfos,
                (tvdssInfo, i, next) => {
                    if (!tvdssInfo) {
                        tvdssDatas[i] = null;
                        return next();
                    }
                    getCurveDataPromise(tvdssInfo.idCurve, dbConnection, username).then(d => {
                        tvdssDatas[i] = d;
                        next();
                    });
                },
                (err) => {
                    if (err) rej(err);
                    res();
                }
            );
        });
    }
    if (req.body.idZoneSets) {
        let exportUnit = req.body.exportUnit;
        let arrData = [];
        for (let zonesetIdx = 0; zonesetIdx < req.body.idZoneSets.length; zonesetIdx++) {
            const id = req.body.idZoneSets[zonesetIdx]
            const zoneSet = await req.dbConnection.ZoneSet.findByPk(id, {
                include: [
                    {
                        model: req.dbConnection.Zone,
                        include: [{ model: req.dbConnection.ZoneTemplate }]
                    },
                    {
                        model: req.dbConnection.Well
                    }
                ]
            });
            if (!exportUnit) {
                exportUnit = zoneSet.well.unit;
            }
            zoneSet.zones.forEach(zone => {
                let startDepth = parseFloat(zone.startDepth).toFixed(4);
                let endDepth = parseFloat(zone.endDepth).toFixed(4);
                let row = [
                    zoneSet.well.name,
                    zone.zone_template.name.replace(/,/g, ''),
                    convertLength.convertDistance(startDepth, 'm', exportUnit).toFixed(4),
                    convertLength.convertDistance(endDepth, 'm', exportUnit).toFixed(4),
                ]
                if (tvdInfos[zonesetIdx]) {
                    row = [...row, ...getTVDValue(tvdDatas[zonesetIdx], tvdInfos[zonesetIdx], startDepth, endDepth).map(v => {
                        return convertLength
                            .convertDistance(v, tvdInfos[zonesetIdx].unit, exportUnit)
                            .toFixed(4);
                    })];
                }
                if (tvdssInfos[zonesetIdx]) {
                    row = [...row, ...getTVDValue(tvdssDatas[zonesetIdx], tvdssInfos[zonesetIdx], startDepth, endDepth).map(v => {
                        return convertLength
                            .convertDistance(v, tvdssInfos[zonesetIdx].unit, exportUnit)
                            .toFixed(4);
                    })];
                }
                arrData.push(row);
            });
        }
        arrData.sort(compareFn);
        let unitArr = ['', '', exportUnit, exportUnit];
        if (tvdInfos && tvdInfos.length)
            unitArr = [...unitArr, exportUnit, exportUnit];
        if (tvdssInfos && tvdssInfos.length)
            unitArr = [...unitArr, exportUnit, exportUnit];
        arrData.unshift(unitArr);
        arrData.unshift(['', '', '', '']); //??????????????
        if (tvdInfos && tvdInfos.length)
            headers = [...headers, 'Top_TVD', 'Bottom_TVD'];
        if (tvdssInfos && tvdssInfos.length)
            headers = [...headers, 'Top_TVDSS', 'Bottom_TVDSS'];
        csv
            .write(arrData, { headers })
            .pipe(res);

        function getTVDValue(curveData, tvdInfo, startDepth, endDepth) {
            let tvdStart = 0;
            let tvdEnd = 0;
            if (tvdInfo.step) {
                tvdStart = (curveData[Math.ceil((parseFloat(startDepth).toFixed(4) - parseFloat(tvdInfo.top).toFixed(4)) / parseFloat(tvdInfo.step).toFixed(4))] || { x: 0 }).x;
                tvdEnd = (curveData[Math.ceil((parseFloat(endDepth).toFixed(4) - parseFloat(tvdInfo.top).toFixed(4)) / parseFloat(tvdInfo.step).toFixed(4))] || { x: 0 }).x;
            } else {
                tvdStart = curveData.find((d, idx) => {
                    return parseFloat(d.y).toFixed(4) >= parseFloat(startDepth).toFixed(4);
                }).x
                tvdEnd = curveData.find((d, idx) => {
                    return parseFloat(d.y).toFixed(4) >= parseFloat(endDepth).toFixed(4);
                }).x
            }
            return [parseFloat(tvdStart).toFixed(4), parseFloat(tvdEnd).toFixed(4)];
        }
    } else {
        res.send(
            ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, 'Missing zoneset id')
        );
    }
});

router.post('/marker-set', async function (req, res) {
    let headers = ['Well_name', 'Maker_name', 'Depth'];
    let dbConnection = req.dbConnection;
    let username = req.decoded.username;
    let tvdInfos = req.body.tvdInfos || [];
    let tvdssInfos = req.body.tvdssInfos || [];
    let tvdDatas = [];
    let tvdssDatas = [];
    if (tvdInfos && tvdInfos.length) {
        for (let i = 0; i < tvdInfos.length; i++) {
            let tvdInfo = tvdInfos[i];
            if (!tvdInfo) {
                tvdDatas[i] = null;
                continue;
            }
            tvdDatas[i] = await getCurveDataPromise(tvdInfo.idCurve, dbConnection, username);
        }
    }
    if (tvdssInfos && tvdssInfos.length) {
        for (let i = 0; i < tvdssInfos.length; i++) {
            let tvdssInfo = tvdssInfos[i];
            if (!tvdssInfo) {
                tvdssDatas[i] = null;
                continue;
            }
            tvdssDatas[i] = await getCurveDataPromise(tvdssInfo.idCurve, dbConnection, username);
        }
    }
    if (req.body.idMarkerSets) {
        let arrData = [];
        // let exportUnit = null;
        let exportUnit = req.body.exportUnit;
        for (const id of req.body.idMarkerSets) {
            markersetIdx = req.body.idMarkerSets.indexOf(id);
            const markerSet = await req.dbConnection.MarkerSet.findByPk(id, {
                include: [
                    {
                        model: req.dbConnection.Marker,
                        include: [{ model: req.dbConnection.MarkerTemplate }]
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
                    let depth = parseFloat(marker.depth).toFixed(4);
                    let cDepth = convertLength
                        .convertDistance(parseFloat(marker.depth), 'm', exportUnit)
                        .toFixed(4);
                    let row = [
                        markerSet.well.name,
                        marker.marker_template.name.replace(/,/g, ''),
                        cDepth
                    ];
                    if (tvdInfos[markersetIdx]) {
                        row = [...row, ...getTVDValue(tvdDatas[markersetIdx], tvdInfos[markersetIdx], depth).map(v => {
                            return convertLength
                                .convertDistance(v, tvdInfos[markersetIdx].unit, exportUnit)
                                .toFixed(4);
                        })];
                    }
                    if (tvdssInfos[markersetIdx]) {
                        row = [...row, ...getTVDValue(tvdssDatas[markersetIdx], tvdssInfos[markersetIdx], depth).map(v => {
                            return convertLength
                                .convertDistance(v, tvdssInfos[markersetIdx].unit, exportUnit)
                                .toFixed(4);
                        })];
                    }
                    arrData.push(row);
                });
            } else {
                markerSet.markers.forEach(marker => {
                    let depth = parseFloat(marker.depth).toFixed(4);
                    let row = [
                        markerSet.well.name,
                        marker.marker_template.name.replace(/,/g, ''),
                        depth
                    ];
                    if (tvdInfos[markersetIdx]) {
                        // row = [...row, ...getTVDValue(tvdDatas[markersetIdx], tvdInfos[markersetIdx], depth)];
                        row = [...row, ...getTVDValue(tvdDatas[markersetIdx], tvdInfos[markersetIdx], depth).map(v => {
                            return convertLength
                                .convertDistance(v, tvdInfos[markersetIdx].unit, exportUnit)
                                .toFixed(4);
                        })];
                    }
                    if (tvdssInfos[markersetIdx]) {
                        // row = [...row, ...getTVDValue(tvdssDatas[markersetIdx], tvdssInfos[markersetIdx], depth)];
                        row = [...row, ...getTVDValue(tvdssDatas[markersetIdx], tvdssInfos[markersetIdx], depth).map(v => {
                            return convertLength
                                .convertDistance(v, tvdssInfos[markersetIdx].unit, exportUnit)
                                .toFixed(4);
                        })];
                    }
                    arrData.push(row);
                });
            }
        }
        // console.log(arrData);
        arrData.sort(compareFn);
        let unitArr = ['', '', exportUnit];
        if (tvdInfos && tvdInfos.length)
            unitArr = [...unitArr, exportUnit];
        if (tvdssInfos && tvdssInfos.length)
            unitArr = [...unitArr, exportUnit];
        arrData.unshift(unitArr);
        arrData.unshift(['', '', '']);
        if (tvdInfos && tvdInfos.length)
            headers = [...headers, 'TVD'];
        if (tvdssInfos && tvdssInfos.length)
            headers = [...headers, 'TVDSS'];
        csv
            .write(arrData, { headers })
            .pipe(res);

        function getTVDValue(curveData, tvdInfo, depth) {
            let tvd = 0;
            if (tvdInfo.step) {
                tvd = (curveData[Math.floor((parseFloat(depth).toFixed(4) - parseFloat(tvdInfo.top).toFixed(4)) / parseFloat(tvdInfo.step).toFixed(4))] || { x: 0 }).x;
            } else {
                tvd = curveData.find((d, idx) => {
                    return parseFloat(d.y).toFixed(4) >= parseFloat(depth).toFixed(4);
                }).x
            }
            return [parseFloat(tvd).toFixed(4)];
        }
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
