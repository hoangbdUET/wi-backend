'use strict';
const express = require('express');
const config =  require('config');

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
    if(section.wellInfo) {
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
    if(section.wellInfo.curves) {
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

router.post('/file', upload.single('file'), function (req, res) {
    // TODO:
    // Check if req.body.id_project != undefined || null
    // Check if req.body.id_project is valid
    if (!req.body.id_project || req.body.id_project === "") {
        return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'idProject can not be null')));

    }
    let list = req.file.filename.split('.');
    let fileFormat = list[list.length - 1];
    if (/LAS/.test(fileFormat.toUpperCase())) {
        wiImport.setBasePath(config.curveBasePath);
        wiImport.extractLAS2(inDir + req.file.filename, function (result) {
            let projectInfo = {
                idProject:req.body.id_project
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
            if (!req.body.id_well || req.body.id_well === "") {
                importUntils.createCurvesWithProjectExist(projectInfo,wellInfo,datasetInfo, curvesInfo)
                    .then(function (result) {
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                    })
                    .catch(function (err) {
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));
                    })
            }
            else {
                //do something
                //tao dataset %% curves for well exist
                wellInfo.idWell = parseInt(req.body.id_well);
                if (!req.body.id_dataset || req.body.id_dataset === "") {
                    importUntils.createCurvesWithWellExist(wellInfo,datasetInfo,curvesInfo,{overwrite:false})
                        .then(function (result) {
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                        })
                        .catch(function (err) {
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));
                        })
                }
                else {
                    //create curves
                    datasetInfo = new Object();
                    datasetInfo.idDataset = parseInt(req.body.id_dataset);
                    importUntils.createCurvesWithDatasetExist(wellInfo,datasetInfo, curvesInfo, {overwrite:false})
                        .then(function (result) {
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                        })
                        .catch(function (err) {
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));
                        })

                }
            }
        }, {
            projectId: parseInt(req.body.id_project),
            wellId: "someWellId",
            label: 'datasetLabel'
        });
    }
    else {
        wiImport.extractASC(inDir + req.file.filename, function (result) {
            //do something with result
            let projectInfo = {
                idProject:req.body.id_project
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
                        wellInfo:wellInfo,
                    });
            });
            let results = new Array();
            console.log('well info la ', JSON.stringify(wellsInfo,null,2));
            if (!req.body.id_well || req.body.id_well === "") {
                async.each(wellsInfo, function (wellInfo, callback) {
                    importUntils.createCurvesWithProjectExist(projectInfo,wellInfo.wellInfo,datasetInfo, wellInfo.wellInfo.curves)
                        .then(function (result) {
                            results.push(result);
                            callback();
                        })
                        .catch(function (err) {
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));
                        });

                }, function (err) {
                   if(err) {
                       res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));

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
                    if(wellsInfo.length > 1) {
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,"File has many wells")));
                    }
                    else {
                        importUntils.createCurvesWithWellExist(wellInfo,datasetInfo,curvesInfo,{overwrite:false})
                            .then(function (result) {
                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                            })
                            .catch(function (err) {
                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));
                            });
                    }
                }
                else {
                    //create curves
                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,"File has many wells")));

                }
            }

        },{
            label: 'datasetLabel'
        });
    }
    //return res.end(JSON.stringify(req.file));
});

router.post('/files', function (req, res) {
    let now = Date.now();
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.uploadDir = 'uploads_temp';
    form.parse(req, function (err, fields, files) {
        // res.end(util.inspect({fields, files}));
        let id_wells = [];
        let id_datasets = [];
        for (var key in fields) if (fields.hasOwnProperty(key)) {
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
        console.log('id_wells',id_wells);
        console.log('\n');
        console.log('id_datasets',id_datasets);
        let results = [];
        let event = new EventEmitter();
        event.on('done-process-files', function(){
            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, results)));
        });
        for (var key in files) if (files.hasOwnProperty(key)) {
            let keyParts = key.split(/[\[\]]/, 2);
            let i = keyParts[1];
            let file = files[key];
            let fileNameParts = file.name.split('.');
            let fileFormat = fileNameParts[fileNameParts.length - 1];
            if (/LAS/.test(fileFormat.toUpperCase())) {
                wiImport.setBasePath(config.curveBasePath);
                wiImport.extractLAS2(file.path, function (result) {
                    fs.unlinkSync(file.path);
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
                        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, curvesInfo)
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
                            importUntils.createCurvesWithWellExist(wellInfo, datasetInfo, curvesInfo, { overwrite: false })
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
                            importUntils.createCurvesWithDatasetExist(wellInfo, datasetInfo, curvesInfo, { overwrite: false })
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
                    }
                }, {
                        projectId: parseInt(fields.id_project),
                        wellId: 'someWellId',
                        label: 'datasetLabel'
                    });
            }
            else if (/ASC/.test(fileFormat.toUpperCase())) {
                wiImport.extractASC(inDir + file.name, 'idProject', 'idWell', function (result) {
                    //do something with result
                });
            }
            else if (/CSV/.test(fileFormat.toUpperCase())) {
                wiImport.extractCSV(inDir + file.name, 'idProject', 'idWell');
            }
            //return res.end(JSON.stringify(req.file));
        }
    });
    form.on('error', function (err) {
        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Internal server error')));
    });
    return;
});

module.exports = router;