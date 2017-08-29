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
    //console.log("SECTION : " + section.toString());
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
        //do something
        //tao dataset %% curves for well exist
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
                return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
            }
            else {
                extractLAS2Done(result, {
                    idProject: idProject,
                    idWell: idWell,
                    idDataset: idDataset
                }, function (err, result) {
                    console.log(err.stack);
                    if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
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

function handleMultiFiles(req, res) {
    let idProject;
    let idWells = new Array();
    let idDatasets = new Array();
    let files = new Array();
    console.log(req.body);


    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.uploadDir = '/tmp';

    form.on('end', function () {
        var responseArray = new Array();
        console.log('form on end:', idProject, idWells, idDatasets);
        if (isNaN(idProject)) {
            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'id_project param is invalid')));
            return;
        }
        if (files.length <= 0) {
            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'No file uploaded')));
            return;
        }

        let event = new EventEmitter();
        event.on('done-process-file', function () {
            if (responseArray.length >= files.length) {
                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseArray)));
            }
        });

        files.forEach(function (f, index) {
            if (!/\.LAS$/.test(f.name.toUpperCase())) {
                //failure case
                responseArray.push(
                    ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, "not .las file")
                );
                event.emit('done-process-file');
                return;
            }
            extractLAS2File(f.path, idProject, idWells[index], idDatasets[index], function (result) {
                // Success callback
                responseArray.push(
                    ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)
                );
                event.emit('done-process-file');
            }, function (err) {
                // error callback
                responseArray.push(
                    ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)
                );
                event.emit('done-process-file');
            });
        });
    });

    form.on('field', function (name, value) {
        // TODO:process field
        if (name.trim() == "id_project") {
            idProject = parseInt(value);
        }
        else if (/^id_wells/.test(name)) {
            idWells.push(parseInt(value));
        }
        else if (/^id_datasets/.test(name)) {
            idDatasets.push(parseInt(value));
        }
    });
    form.on('file', function (name, file) {
        files.push(file);
    });
    form.on('error', function (err) {
        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Internal server error')));
    });

    form.parse(req);
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
                wiImport.extractWellLAS2(req.files[i].path, (err, result) => {
                    if (err) {
                        event.emit(err);
                    } else {
                        let fileInfo = new Object();
                        fileInfo.name = files[i].filename;
                        fileInfo.originalname = files[i].originalname;
                        fileInfo.wellInfo = null;
                        fileInfo.datasetName = null;
                        fileInfo.curves = null;
                        result.forEach((section) => {
                            if (/~WELL/g.test(section.name)) {
                                let wellInfo = getWellInfo(section);
                                fileInfo.datasetName = wellInfo.name;
                                fileInfo.wellInfo = wellInfo;
                            }
                            else if (/~CURVE/g.test(section.name)) {
                                let curvesInfo = getCurveInfo(section);
                                fileInfo.curves = curvesInfo;
                            }
                        });
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
                            //emit
                            //if (err) return res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err));
                            //res.send(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result));
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


//router.post('/files', handleMultiFiles);
/*
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
<<<<<<< HEAD

        async.forEachOf(id_wells, function (item, i, callback) {
            let key = 'file[' + i + ']';
            let fileNameParts = files[key].name.split('.');
=======
        for (var key in files) {
            let keyParts = key.split(/[\[\]]/, 2);
            let i = keyParts[1];
            let file = files[key];
            let fileNameParts = file.name.split('.');
>>>>>>> master
            let fileFormat = fileNameParts[fileNameParts.length - 1];
            let idProject = parseInt(fields.id_project);
            let idWell = parseInt(id_wells[i]);
            let idDataset = parseInt(id_datasets[i]);
            if (/LAS/.test(fileFormat.toUpperCase())) {
                wiImport.setBasePath(config.curveBasePath);
<<<<<<< HEAD
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
=======
                wiImport.extractLAS2(file.path, function (result) {
                    //fs.unlinkSync(file.path);
                    let projectInfo = {
                        idProject: fields.id_project
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
                    if (!id_wells[i] || id_wells[i] === "") {
                        importUtils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, curvesInfo)
                            .then(function (result) {
                                results.push(result);
                                if (i == id_wells.length - 1) {
                                    event.emit('done-process-files');
                                }
                            })
                            .catch(function (err) {
                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                            })
                    }
                    else {
                        //tao dataset %% curves for exist well
                        wellInfo.idWell = parseInt(id_wells[i]);
                        if (!id_datasets[i] || id_datasets[i] === "") {
                            importUtils.createCurvesWithWellExist(wellInfo, datasetInfo, curvesInfo, { overwrite: false })
                                .then(function (result) {
                                    results.push(result);
                                    if (i == id_wells.length - 1) {
                                        event.emit('done-process-files');
                                    }
                                })
                                .catch(function (err) {
                                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                })
                        }
                        else {
                            //create curves
                            datasetInfo = new Object();
                            datasetInfo.idDataset = parseInt(id_datasets[i]);
                            importUtils.createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, { overwrite: false })
                                .then(function (result) {
                                    results.push(result);
                                    if (i == id_wells.length - 1) {
                                        event.emit('done-process-files');
                                    }
                                })
                                .catch(function (err) {
                                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                })
>>>>>>> master

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
*/

module.exports = router;
