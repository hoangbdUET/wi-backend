'use strict';
const express = require('express');
const config = require('config');

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

function getCurveInfo(section, datasetKey) {
    let curvesInfo = new Array();
    if (section.wellInfo) {
        section.wellInfo.curves.forEach(function (item) {
            let curveInfo = new Object();
            curveInfo.name = item.name;
            curveInfo.unit = item.unit;
            curveInfo.initValue = "abc";
            curveInfo.family = "VNU";
            curveInfo.dataset = datasetKey;
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
            curveInfo.dataset = datasetKey;
            curveInfo.idDataset = null;
            curvesInfo.push(curveInfo);
        });
    }
    return curvesInfo;
}

function extractLAS2Done(result, options, callbackGetResult) {
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
            curvesInfo = getCurveInfo(section, wellInfo.name);
        }
    });
    datasetInfo.name = wellInfo.name;
    datasetInfo.datasetLabel = wellInfo.name;
    datasetInfo.datasetKey = wellInfo.name;
    if (!options.idWell || options.idWell === "") {
        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, curvesInfo)
            .then(function (result) {
                callbackGetResult(false, result);
                //res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
            })
            .catch(function (err) {
                callbackGetResult(err, null);
            })
    }
    else {
        //do something
        //tao dataset %% curves for well exist
        wellInfo.idWell = parseInt(options.idWell);
        if (!options.idDataset || options.idDataset === "") {
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

router.post('/file', upload.single('file'), function (req, res) {
    // TODO:
    // Check if req.body.id_project != undefined || null
    // Check if req.body.id_project is valid
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
        wiImport.extractLAS2(req.file.path, function (err, result) {
            if (err) {
                return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
            }
            else {
                extractLAS2Done(result, {
                    idProject: idProject,
                    idWell: idWell,
                    idDataset: idDataset
                }, function (err, result) {
                    if(err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                    wiImport.deleteFile(req.file.path);
                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                });
            }
        });

    }
    else if(/ASC/.test(fileFormat.toUpperCase())) {
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
                    importUntils.createCurvesWithProjectExist(projectInfo, wellInfo.wellInfo, datasetInfo, wellInfo.wellInfo.curves)
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

router.post('/files', function (req, res) {
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.uploadDir = 'uploads';
    form.parse(req, function (err, fields, files) {
        if (!fields.id_project || fields.id_project === "") {
            return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'idProject can not be null')));
        }
        if (!files || !Object.keys(files).length) {
            return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'One or more files must be sent')));
        }
        let id_wells = [];
        let id_datasets = [];
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) {
                var value = fields[key];
                if (/^id_wells/.test(key)) {
                    let keyParts = key.split(/[\[\]]/, 2);
                    let index = keyParts[1];
                    let valueInt = Number.parseInt(value);
                    if (!Number.isNaN(valueInt)) {
                        id_wells[index] = valueInt;
                    } else id_wells[index] = '';
                }
                if (/^id_datasets/.test(key)) {
                    let keyParts = key.split(/[\[\]]/, 2);
                    let index = keyParts[1];
                    let valueInt = Number.parseInt(value);
                    if (!Number.isNaN(valueInt)) {
                        id_datasets[index] = valueInt;
                    } else id_datasets[index] = '';
                }
            }
        }
        console.log('id_wells', id_wells);
        console.log('\n');
        console.log('id_datasets', id_datasets);
        let results = [];
        let event = new EventEmitter();
        event.on('done-process-files', function () {
            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, results)));
        });

        async.forEachOf(id_wells, function (item, i, callback) {
            let key = 'file[' + i + ']';
            let fileNameParts = files[key].name.split('.');
            let fileFormat = fileNameParts[fileNameParts.length - 1];
            let idProject = parseInt(fields.id_project);
            let idWell = parseInt(id_wells[i]);
            let idDataset = parseInt(id_datasets[i]);
            if (/LAS/.test(fileFormat.toUpperCase())) {
                wiImport.setBasePath(config.curveBasePath);
                wiImport.extractLAS2(files[key].path, function (err, result) {
                    if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                    else {
                        extractLAS2Done(result, {
                            idProject: idProject,
                            idWell: idWell,
                            idDataset: idDataset
                        }, function (err, result) {
                            if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Internal server error')));
                            wiImport.deleteFile(files[key].path);
                            results.push(result);
                            callback();
                        });

                    }
                });
            }
            else {
               return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'File not support')));

            }
        }, function (err) {
            if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Internal server error')));
            else {
                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, results)));
            }
        });
    });
    form.on('error', function (err) {
        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Internal server error', err)));
    });
    return;
});

module.exports = router;