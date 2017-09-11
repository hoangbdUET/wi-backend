'use strict';
const express = require('express');
const config = require('config');

const util = require('util');

const fs = require('fs');
const formidable = require('formidable');
const EventEmitter = require('events');

const multer = require('multer');
const cors = require('cors');
var router = express.Router();
let inDir = __dirname + '/../../uploads/';
let wiImport = require('wi-import');
let async = require('async');
let errorCodes = require('../../error-codes');
let well = require('../well/well.model');
let dataset = require('../dataset/dataset.model');
let curve = require('../curve/curve.model');
let ResponseJSON = require('../response');
let importUntils = require('../import-untils/import-untils');
let bodyParser = require('body-parser');
let messageNotice = {
    error: 'Import Error',
    success: 'Import Success'
};
router.use(cors());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({storage: storage});

function getWellInfo(section) {
    let wellInfo = {};
    if (section.wellInfo) {
        section.wellInfo.curves = getCurveInfo(section, section.wellInfo.name);
        wellInfo = section.wellInfo;
    }
    else {
        section.content.forEach(function (item) {
            if (/STRT/g.test(item.name.toUpperCase())) {
                wellInfo.topDepth = item.data;
            }
            if (/STOP/g.test(item.name.toUpperCase())) {
                wellInfo.bottomDepth = item.data;
            }
            if (/STEP/g.test(item.name.toUpperCase())) {
                wellInfo.step = item.data;
            }
            if (/WELL/g.test(item.name.toUpperCase())) {
                wellInfo.name = item.data;
            }
        });
    }
    return wellInfo;
}

//function getCurveInfo(section, datasetKey) {
function getCurveInfo(section) {
    let curvesInfo = new Array();
    if (section.wellInfo) {
        section.wellInfo.curves.forEach(function (item) {
            let curveInfo = new Object();
            curveInfo.name = item.name;
            curveInfo.unit = item.unit;
            curveInfo.initValue = "abc";
            curveInfo.family = "VNU";
            //curveInfo.dataset = "hoang";
            curveInfo.idDataset = null;
            curvesInfo.push(curveInfo);
        });
    }
    else {
        section.content.forEach(function (item) {
            let curveInfo = new Object();
            curveInfo.name = item.name;
            curveInfo.unit = item.unit;
            curveInfo.initValue = "abc";
            curveInfo.family = "VNU";
            //curveInfo.dataset = "hoang";
            curveInfo.idDataset = null;
            curvesInfo.push(curveInfo);
        });
    }
    return curvesInfo;
}

function extractLAS2Done_(result, options, callbackGetResult) {
    let projectInfo = {
        idProject: options.idProject
    };
    let wellInfo = null;
    let curvesInfo = null;
    let datasetInfo = {
        idWell: null,
        name: "",
        datasetKey: "",
        datasetLabel: ""
    };
    result.forEach(function (section) {
        if (/~WELL/g.test(section.name)) {
            wellInfo = getWellInfo(section);
        }
        else if (/~CURVE/g.test(section.name)) {
            curvesInfo = getCurveInfo(section);
        }
    });
    datasetInfo.name = wellInfo.name;
    datasetInfo.datasetLabel = wellInfo.name;
    datasetInfo.datasetKey = wellInfo.name;
    if (!options.idWell || options.idWell === "") {
        console.log("Create curves with project exist");
        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, curvesInfo)
            .then(function (result) {
                callbackGetResult(false, result);
            })
            .catch(function (err) {
                callbackGetResult(err, null);
            })
    }
    else {
        wellInfo.idWell = parseInt(options.idWell);
        if (!options.idDataset || options.idDataset === "") {
            console.log("Create curves with Well exist");
            importUntils.createCurvesWithWellExist(wellInfo, datasetInfo, curvesInfo, {overwrite: false})
                .then(function (result) {
                    callbackGetResult(false, result);
                })
                .catch(function (err) {
                    callbackGetResult(err, result);
                })
        }
        else {
            //create curves
            datasetInfo = new Object();
            datasetInfo.idDataset = parseInt(options.idDataset);
            console.log("Create curves with dataset exist");
            importUntils.createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, {overwrite: false})
                .then(function (result) {
                    callbackGetResult(false, result);
                })
                .catch(function (err) {
                    callbackGetResult(err, result);
                })

        }
    }

}

function extractLAS2Done(result, options, callback) {
    let projectInfo = {
        idProject: options.idProject
    }
    let wellInfo = {
        name: result.wellname,
        topDepth: result.start,
        bottomDepth: result.stop,
        step: result.step,
    }
    let datasetInfo = result.datasetInfo;
    let curvesInfo = result.datasetInfo[0].curves;
    if (!options.idWell || options.idWell == "") {

        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo).then(rs => {
            callback(false, rs);
        }).catch(err => {
            callback(err, null);
            console.log(err);
        });
    } else {
        wellInfo.idWell = options.idWell;
        if (!options.idDataset || options.idDataset == "") {
            importUntils.createCurvesWithWellExist(wellInfo, datasetInfo[0], {overwrite: false}).then(rs => {
                callback(false, rs);
            }).catch(err => {
                callback(err, null);
            });
        } else {
            datasetInfo[0].idDataset = options.idDataset;
            importUntils.createCurvesWithDatasetExist(wellInfo, datasetInfo[0], curvesInfo, {overwrite: false}).then(rs => {
                callback(false, rs);
            }).catch(err => {
                callback(err, null);
            });
        }
    }

}

function extractLAS3Done(result, options, callback) {
    let response = [];
    let projectInfo = {
        idProject: options.idProject
    }
    let wellInfo = {
        name: result.wellname,
        topDepth: result.start,
        bottomDepth: result.stop,
        step: result.step,
    }
    let datasetInfo = result.datasetInfo;
    let curvesInfo = result.datasetInfo[0].curves;
    if (!options.idWell || options.idWell == "") {
        console.log("CREATE CURVES WITH PROJECT EXISTS 3.0");
        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo).then(rs => {
            callback(false, rs);
        }).catch(err => {
            callback(err, null);
            console.log(err);
        });

    } else {
        wellInfo.idWell = options.idWell;
        if (!options.idDataset || options.idDataset == "") {
            importUntils.createCurvesWithWellExist(wellInfo, datasetInfo[0], {overwrite: false}).then(rs => {
                callback(false, rs);
            }).catch(err => {
                callback(err, null);
            });
        } else {
            datasetInfo[0].idDataset = options.idDataset;
            importUntils.createCurvesWithDatasetExist(wellInfo, datasetInfo[0], curvesInfo, {overwrite: false}).then(rs => {
                callback(false, rs);
            }).catch(err => {
                callback(err, null);
            });
        }
    }

}

router.post('/file', upload.single('file'), function (req, res) {
    //console.log(req.body);
    if (!req.body.id_project || req.body.id_project === "") {
        return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'idProject can not be null')));

    }
    let list = req.file.filename.split('.');
    let fileFormat = list[list.length - 1];
    let idProject = parseInt(req.body.id_project);
    let idWell = parseInt(req.body.id_well);
    let idDataset = parseInt(req.body.id_dataset);
    if (/LAS/.test(fileFormat.toUpperCase())) {
        wiImport.setBasePath(config.curveBasePath);
        console.log("Call extractLAS2");
        wiImport.extractLAS2(req.file.path, function (err, result) {
            if (err) {
                if (/LAS_3_DETECTED/.test(err)) {
                    wiImport.extractLAS3(req.file.path, function (err, result) {
                        if (err) console.log(err);
                        //console.log(result);
                        extractLAS3Done(result, {
                            idProject: idProject,
                            idWell: idWell,
                            idDataset: idDataset
                        }, function (err, rs) {
                            //console.log(rs);
                            if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, rs)));
                        });

                    });
                } else {
                    return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                }
            }
            else {
                extractLAS2Done(result, {
                    idProject: idProject,
                    idWell: idWell,
                    idDataset: idDataset
                }, function (err, rs) {
                    if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, rs)));
                });
            }
        });
    }
    else if (/ASC/.test(fileFormat.toUpperCase())) {
        wiImport.extractASC(inDir + req.file.filename, function (result) {
            //do something with result
            console.log(result);
            let projectInfo = {
                idProject: req.body.id_project
            };
            let wellsInfo = new Array();
            let curvesInfo = null;
            let wellInfo = null;
            let datasetInfo = {
                idWell: null,
                name: "Data Default",
                datasetKey: "datasetKey Default",
                datasetLabel: "DatasetLabel Default"
            };
            let curves = new Array();
            result.data.forEach(function (section) {
                wellInfo = getWellInfo(section);
                //curvesInfo = getCurveInfo(section, wellInfo.name);
                wellsInfo.push({
                    wellInfo: wellInfo,
                });
            });
            let results = new Array();
            console.log('well info la ', JSON.stringify(wellsInfo, null, 2));
            if (!req.body.id_well || req.body.id_well === "") {
                async.each(wellsInfo, function (wellInfo, callback) {
                    importUtils.createCurvesWithProjectExist(projectInfo, wellInfo.wellInfo, datasetInfo, wellInfo.wellInfo.curves)
                        .then(function (result) {
                            results.push(result);
                            callback();
                        })
                        .catch(function (err) {
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                        });

                }, function (err) {
                    if (err) {
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));

                    }
                    else {
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, results)));
                    }
                });
            }
            else {
                //do something
                //tao dataset %% curves for well exist
                wellInfo.idWell = parseInt(req.body.id_well);
                if (!req.body.id_dataset || req.body.id_dataset === "") {
                    if (wellsInfo.length > 1) {
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, "File has many wells")));
                    }
                    else {
                        importUntils.createCurvesWithWellExist(wellInfo, datasetInfo, curvesInfo, {overwrite: false})

                            .then(function (result) {
                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                            })
                            .catch(function (err) {
                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                            });
                    }
                }
                else {
                    //create curves
                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, "File has many wells")));

                }
            }

        }, {
            label: 'datasetLabel'
        });
    }
    else {
        return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, "FIle not support")));
    }
});

function extractLAS2File(filePath, idProject, idWell, idDataset, successCb, errorCb) {
    wiImport.setBasePath(config.curveBasePath);
    wiImport.extractLAS2(filePath, function (err, result) {
        if (err) {
            errorCb(err);
        }
        else {
            let projectInfo = {
                idProject: idProject
            };
            let wellInfo = null;

            let curvesInfo = null;

            let datasetInfo = {
                idWell: null,
                name: "",
                datasetKey: "",
                datasetLabel: ""
            };

            result.forEach(function (section) {
                if (/~WELL/g.test(section.name)) {
                    wellInfo = getWellInfo(section);
                }
                else if (/~CURVE/g.test(section.name)) {
                    curvesInfo = getCurveInfo(section, wellInfo.name);
                }
            });
            datasetInfo.name = wellInfo.name;
            datasetInfo.datasetLabel = wellInfo.name;
            datasetInfo.datasetKey = wellInfo.name;
            if (isNaN(idWell)) {
                importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, curvesInfo)
                    .then(successCb)
                    .catch(errorCb)
            }
            else {
                //do something
                //tao dataset %% curves for well exist
                wellInfo.idWell = idWell;
                if (isNaN(idDataset)) {
                    importUntils.createCurvesWithWellExist(wellInfo, datasetInfo, curvesInfo, {overwrite: false})
                        .then(successCb)
                        .catch(errorCb)
                }
                else {
                    //create curves
                    datasetInfo = new Object();
                    datasetInfo.idDataset = idDataset;
                    importUntils.createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, {overwrite: false})
                        .then(successCb)
                        .catch(errorCb);
                }
            }
        }
    });
}

router.post('/files/prepare', upload.array('file'), (req, res) => {
    //console.log(req.files);
    let files = req.files;
    let response = [];
    let event = new EventEmitter.EventEmitter();
    event.on('done-extract-well', (rs) => {
        response.push(rs);
        fs.unlink(__dirname + '/../../uploads/' + rs.name, err => {
            if (err) console.log(err);
        });
        if (response.length == files.length) {
            res.send(ResponseJSON(errorCodes.CODES.SUCCESS, 'Successful', response));
        }
    });
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            let list = files[i].filename.split('.');
            let fileFormat = list[list.length - 1];
            if (/LAS/.test(fileFormat.toUpperCase())) {
                //LAS file
                wiImport.setBasePath(config.curveBasePath);
                wiImport.extractInfoOnly(req.files[i].path, (err, result) => {
                    if (err) {
                        event.emit(err);
                    } else {
                        console.log(result);
                        let fileInfo = new Object();
                        fileInfo.name = files[i].filename;
                        fileInfo.originalname = files[i].originalname;
                        fileInfo.wellInfo = {
                            topDepth: result.start,
                            bottomDepth: result.stop,
                            step: result.step,
                            name: result.wellname
                        };
                        fileInfo.datasetName = result.datasetInfo[0].name;
                        fileInfo.curves = result.datasetInfo[0].curves;

                        event.emit('done-extract-well', fileInfo);
                    }
                });
            } else {
                //another file type
            }
        }
    } else {
        res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'No File selected'));
    }
});


router.post('/files', upload.array('file'), (req, res) => {
    if (req.files.length > 0) {
        console.log("Files uploaded : " + req.files.length);
        let event = new EventEmitter.EventEmitter();
        let response = [];
        event.on('done', function (rs) {
            response.push(rs);
            if (response.length == req.files.length) {
                res.send(ResponseJSON(errorCodes.CODES.SUCCESS, 'Successful', response));
            }
        });
        let idProject = parseInt(req.body.id_project);
        let idWell = parseInt(req.body.id_well);
        let idDataset = parseInt(req.body.id_dataset);
        for (let i = 0; i < req.files.length; i++) {
            let list = req.files[i].filename.split('.');
            let fileFormat = list[list.length - 1];
            console.log(i + " ==== " + fileFormat);
            if (/LAS/.test(fileFormat.toUpperCase())) {
                wiImport.setBasePath(config.curveBasePath);
                console.log("Call extractLAS2 : " + i);
                console.log(req.files[i].path);
                wiImport.extractLAS2(req.files[i].path, function (err, result) {
                    if (err) {
                        return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                    }
                    else {
                        extractLAS2Done(result, {
                            idProject: idProject,
                            idWell: idWell[i],
                            idDataset: idDataset[i]
                        }, function (err, result) {
                            if (err) {
                                event.emit('done', err);
                            } else {
                                event.emit('done', result);
                            }

                        });
                    }
                });

            } else {
                //another files
            }
        }
    } else {
        res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'No file'));
    }
});

module.exports = router;
