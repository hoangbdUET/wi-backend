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
let project = require('../project/project.model');
let family = require('../family/family.model');
//let family = require('../family/family.model');
let ResponseJSON = require('../response');
let importUntils = require('../import-untils/import-untils');
let bodyParser = require('body-parser');
let uploadModel = require('./upload.model');
let messageNotice = {
    error: 'Import Error',
    success: 'Import Success'
};
router.use(cors());

function isNumBer(n) {
    return !isNaN(n / 0);
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({storage: storage});

function extractLAS2Done(result, options, callback, dbConnection, createdBy, updatedBy) {
    let projectInfo = {
        idProject: options.idProject
    }
    let wellInfo = {
        name: result.wellname,
        topDepth: result.start.replace(/,/g, ""),
        bottomDepth: result.stop.replace(/,/g, ""),
        step: result.step.replace(/,/g, ""),
    }
    let datasetInfo = result.datasetInfo;
    let curvesInfo = result.datasetInfo[0].curves;
    // console.log(options);
    // console.log(isNumBer(options.idWell));
    if (!options.idWell || options.idWell == "") {
        console.log("CREATE CURVES WITH PROJECT EXIST");
        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo[0], dbConnection, createdBy, updatedBy).then(rs => {
            callback(false, rs);
        }).catch(err => {
            callback(null, null);
            console.log(err.message);
        });
    } else {
        //wellInfo.idWell = options.isString ? uploadModel.findIdByName(options.idProject, options.idWell, null, dbConnection) : options.idWell;
        wellInfo.idWell = options.idWell;
        if (!options.idDataset || options.idDataset == "") {
            console.log("CREATE CURVES WITH WELL EXIST");
            if (options.isString) {
                uploadModel.findIdByName(options.idProject, options.idWell, null, function (err, success) {
                    if (err) {
                        console.log(err);
                    } else {
                        wellInfo.idWell = success;
                        importUntils.createCurvesWithWellExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(false, result);
                            }
                        }, dbConnection, createdBy, updatedBy);
                    }
                }, dbConnection);
            } else {
                importUntils.createCurvesWithWellExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(false, result);
                    }
                }, dbConnection, createdBy, updatedBy);
            }
        } else {
            console.log("CREATE CURVES WITH DATASET EXIST");
            if (options.isString) {
                uploadModel.findIdByName(options.idProject, options.idWell, options.idDataset, function (err, success) {
                    if (err) {
                        uploadModel.findIdByName(options.idProject, options.idWell, null, function (err, success) {
                            if (err) {
                                console.log(err);
                            } else {
                                wellInfo.idWell = success;
                                importUntils.createCurvesWithWellExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(false, result);
                                    }
                                }, dbConnection, createdBy, updatedBy);
                            }
                        }, dbConnection, createdBy, updatedBy);
                    } else {
                        datasetInfo[0].idDataset = success;
                        uploadModel.findIdByName(options.idProject, options.idWell, null, function (err, success) {
                            wellInfo.idWell = success;
                            console.log(wellInfo);
                            importUntils.createCurvesWithDatasetExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(false, result);
                                }
                            }, dbConnection, createdBy, updatedBy);
                        }, dbConnection, createdBy, updatedBy);
                    }
                }, dbConnection, createdBy, updatedBy);
            } else {
                datasetInfo[0].idDataset = options.idDataset;
                importUntils.createCurvesWithDatasetExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(false, result);
                    }
                }, dbConnection, createdBy, updatedBy);
            }
        }
    }

}

function extractLAS3Done(result, options, callback, dbConnection) {
    //console.log(result.datasetInfo[2].curves);
    let response = [];
    let projectInfo = {
        idProject: options.idProject
    }
    let wellInfo = {
        name: result.wellname,
        topDepth: result.start.replace(/,/g, ""),
        bottomDepth: result.stop.replace(/,/g, ""),
        step: result.step.replace(/,/g, ""),
    }
    let datasetInfo = result.datasetInfo;
    let curvesInfo = result.datasetInfo[0].curves;
    if (!options.idWell || options.idWell == "") {
        console.log("CREATE CURVES WITH PROJECT EXISTS 3.0");
        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo, dbConnection).then(rs => {
            callback(false, rs);
        }).catch(err => {
            callback(err, null);
            console.log(err);
        });

    } else {
        wellInfo.idWell = options.idWell;
        if (!options.idDataset || options.idDataset == "") {
            console.log("CREATE CURVES WITH WELL EXISTS 3.0");
            importUntils.createCurvesWithWellExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(false, result);
                }

            }, dbConnection);
        } else {
            console.log("CREATE CURVES WITH DATASET EXISTS 3.0");
            datasetInfo[0].idDataset = options.idDataset;
            importUntils.createCurvesWithDatasetExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(false, result);
                }
            }, dbConnection);
        }
    }

}

router.post('/file', upload.single('file'), function (req, res) {
    if (!req.body.id_project || req.body.id_project === "") {
        return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'idProject can not be null')));
    }
    let list = req.file.filename.split('.');
    let fileFormat = list[list.length - 1];
    let fileName = req.file.filename.substring(req.file.filename.indexOf('-') + 1, req.file.filename.indexOf('.' + fileFormat));

    let idProject = parseInt(req.body.id_project);
    let idWell = req.body.id_well ? parseInt(req.body.id_well) : 0;
    let idDataset = req.body.id_dataset ? parseInt(req.body.id_dataset) : 0;
    let wellName = req.body.well_name ? req.body.well_name : '';
    let datasetName = req.body.dataset_name ? req.body.dataset_name : '';
    let moreUploadData = new Object();
    moreUploadData.projectName = null;
    moreUploadData.wellName = null;
    moreUploadData.datasetName = null;
    moreUploadData.fileName = fileName;
    uploadModel.getProjectById(idProject, (err, projectName) => {
        if (!err) {
            moreUploadData.projectName = req.decoded.username + projectName;
            uploadModel.getWellById(idWell, (err, _wellName) => {
                if (!err) {
                    moreUploadData.wellName = wellName ? wellName : _wellName;
                    uploadModel.getDatasetById(idDataset, (err, _datasetName) => {
                        if (!err) {
                            moreUploadData.datasetName = datasetName ? datasetName : _datasetName;
                            console.log("MORE UPLOAD DATA : " + JSON.stringify(moreUploadData));
                            if (/LAS/.test(fileFormat.toUpperCase())) {
                                wiImport.setBasePath(config.curveBasePath);
                                console.log("Call extractLAS2");
                                wiImport.extractLAS2(req.file.path, moreUploadData, function (err, result) {
                                    if (err) {
                                        if (/LAS_3_DETECTED/.test(err)) {
                                            wiImport.extractLAS3(req.file.path, moreUploadData, function (err, result) {
                                                if (err) console.log(err);
                                                //console.log(result);
                                                extractLAS3Done(result, {
                                                    idProject: idProject,
                                                    idWell: idWell,
                                                    idDataset: idDataset
                                                }, function (err, rs) {
                                                    if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, rs)));
                                                }, req.dbConnection);

                                            });
                                        } else {
                                            return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                        }
                                    }
                                    else {
                                        // console.log(JSON.stringify(result));
                                        extractLAS2Done(result, {
                                            idProject: idProject,
                                            idWell: idWell,
                                            idDataset: idDataset
                                        }, async function (err, rs) {
                                            let well = await req.dbConnection.Well.findOne({
                                                where: {
                                                    idProject: idProject,
                                                    name: result.wellname
                                                },
                                                include: {
                                                    model: req.dbConnection.Dataset,
                                                    include: {model: req.dbConnection.Curve}
                                                }
                                            });
                                            // let asyncEach = require('async/each');
                                            // asyncEach(well.datasets, function (dataset, doneDataset) {
                                            //     asyncEach(dataset.curves, function (curve, doneCurve) {
                                            //         ((curveName, unit) => {
                                            //             req.dbConnection.FamilyCondition.findAll()
                                            //                 .then(conditions => {
                                            //                     let result = conditions.find(function (aCondition) {
                                            //                         let regex;
                                            //                         try {
                                            //                             regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curveName) && new RegExp("^" + aCondition.unit + "$", "i").test(unit);
                                            //                         } catch (err) {
                                            //                             console.log(err);
                                            //                         }
                                            //                         return regex;
                                            //                     });
                                            //                     if (!result) {
                                            //                         doneCurve();
                                            //                     } else {
                                            //                         result.getFamily()
                                            //                             .then(aFamily => {
                                            //                                 curve.setLineProperty(aFamily);
                                            //                                 doneCurve();
                                            //                             });
                                            //                     }
                                            //                 });
                                            //         })(curve.name, curve.unit);
                                            //     }, function () {
                                            //         doneDataset();
                                            //     });
                                            // }, function () {
                                            //     if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                            //     res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, rs)));
                                            // });
                                            if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, well)));

                                        }, req.dbConnection, req.createdBy, req.updatedBy);
                                    }
                                });
                            }
                            else {
                                return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, "FIle not support")));
                            }
                        }
                    }, req.dbConnection);
                }
            }, req.dbConnection);
        } else {
            console.log(err);
        }
    }, req.dbConnection);

});

router.post('/files/prepare', upload.array('file'), (req, res) => {
    //console.log(req.body);
    let files = req.files;
    let response = [];
    let event = new EventEmitter.EventEmitter();
    event.on('done-extract-well', (rs) => {
        response.push(rs);
        if (!(rs.name == null)) {
            fs.unlink(__dirname + '/../../uploads/' + rs.name, err => {
                //if (err) console.log(err);
            });
        }
        if (response.length == files.length) {
            //console.log(response);
            let hasErr = false;
            response.forEach(function (r) {
                if (r.name == null) hasErr = true;
            });
            if (hasErr) {
                res.send(ResponseJSON(errorCodes.CODES.INTERNAL_SERVER_ERROR, 'LAS 3 Not Allowed'));
                console.log("LAS 3 Not Allowed!");
            } else {
                res.send(ResponseJSON(errorCodes.CODES.SUCCESS, 'Successful', response));
            }
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
                        event.emit('done-extract-well', err);
                        //res.end(ResponseJSON((errorCodes.CODES.INTERNAL_SERVER_ERROR, 'Failed', err)));
                    } else {
                        //console.log(result);
                        let fileInfo = new Object();
                        fileInfo.name = files[i].filename;
                        fileInfo.originalname = files[i].originalname;
                        fileInfo.wellInfo = {
                            topDepth: result.start.replace(/,/g, ""),
                            bottomDepth: result.stop.replace(/,/g, ""),
                            step: result.step.replace(/,/g, ""),
                            name: result.wellname
                        };
                        fileInfo.datasetName = result.datasetInfo[0].name;
                        fileInfo.curves = result.datasetInfo[0].curves;
                        if (req.body.isLoadAllCurves == 'false') {
                            //console.log("hhihi");
                            let length = fileInfo.curves.length;
                            let count = 0;
                            fileInfo.curves.forEach(function (curve, i) {
                                family.checkCurveInFamilyGroup(curve.name, curve.unit, req.body.families, req.dbConnection, function (err, isExist) {
                                    // console.log("IS EXISTS : " + isExist);
                                    if (isExist == 0) {
                                        count++;
                                        fileInfo.curves = fileInfo.curves.filter(function (c) {
                                            return c.name != curve.name;
                                        });

                                    } else {
                                        count++;
                                    }
                                    //console.log(count + "-" + length);
                                    if (count == length) {
                                        event.emit('done-extract-well', fileInfo);
                                    }
                                });

                            });
                        } else {
                            //console.log("haha")
                            event.emit('done-extract-well', fileInfo);
                        }


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
        //console.log("Files uploaded : " + req.files.length);
        //console.log(req.files);
        //console.log(req.body);
        let event = new EventEmitter.EventEmitter();
        let response = [];
        let count = 0;
        let fullInfo = [];
        let curves = [];
        let idProject = parseInt(req.body.id_project);
        let wells = Array.isArray(req.body.id_wells) ? req.body.id_wells : [req.body.id_wells];
        let datasets = Array.isArray(req.body.id_datasets) ? req.body.id_datasets : [req.body.id_datasets];
        let isLoad = Array.isArray(req.body.isLoad) ? req.body.isLoad : [req.body.isLoad];
        let _curves = new Object();
        _curves.data = Array.isArray(req.body.curves.data) ? req.body.curves.data : [req.body.curves.data];
        _curves.length = Array.isArray(req.body.curves.length) ? req.body.curves.length : [req.body.curves.length];
        let settings = req.body.settings;
        let families = req.body.families;
        let _wellHeaders = new Object();
        _wellHeaders.topDepth = Array.isArray(req.body.wellHeaders.topDepth) ? req.body.wellHeaders.topDepth : [req.body.wellHeaders.topDepth];
        _wellHeaders.bottomDepth = Array.isArray(req.body.wellHeaders.bottomDepth) ? req.body.wellHeaders.bottomDepth : [req.body.wellHeaders.bottomDepth];
        _wellHeaders.step = Array.isArray(req.body.wellHeaders.step) ? req.body.wellHeaders.step : [req.body.wellHeaders.step];
        _wellHeaders.depthUnit = Array.isArray(req.body.wellHeaders.depthUnit) ? req.body.wellHeaders.depthUnit : [req.body.wellHeaders.depthUnit];
        let wellHeaders = [];
        isLoad.forEach(function (load) {
            if (load == 'true') count++;
        });
        //console.log("COUNT TRUE : " + count);
        event.on('done', function (rs) {
            response.push(rs);
            if (response.length == count) {
                res.send(ResponseJSON(errorCodes.CODES.SUCCESS, 'Successful', response));
            }
        });
        _wellHeaders.topDepth.forEach(function (top, i) {
            let info = {};
            info.topDepth = _wellHeaders.topDepth[i];
            info.bottomDepth = _wellHeaders.bottomDepth[i];
            info.step = _wellHeaders.step[i];
            info.depthUnit = _wellHeaders.depthUnit[i];
            wellHeaders.push(info);
        });
        _curves.length.forEach(function (l) {
            curves.push(_curves.data.splice(0, l));
        });
        uploadModel.getProjectById(idProject, (err, projectName) => {
            if (!err) {
                isLoad.forEachDone(function (load, i) {
                    let fullinfo = {};
                    fullinfo.isLoad = isLoad[i];
                    fullinfo.file = req.files[i];
                    fullinfo.curve = curves[i];
                    fullinfo.wellName = wells ? wells[i] : null;
                    fullinfo.datasetName = datasets ? datasets[i] : null;
                    fullinfo.wellHeader = wellHeaders[i];
                    fullInfo.push(fullinfo);
                }, function () {
                    ///for each done
                    fullInfo.forEach(function (fileWithFullInfo, i) {
                        if (fileWithFullInfo.isLoad == 'true') {
                            let moreUploadData = new Object();
                            moreUploadData.projectName = req.decoded.username + projectName;
                            moreUploadData.wellName = fileWithFullInfo.wellName;
                            moreUploadData.datasetName = fileWithFullInfo.datasetName;
                            moreUploadData.wellHeader = fileWithFullInfo.wellHeader;
                            moreUploadData.curves = fileWithFullInfo.curve;
                            moreUploadData.isOverwriteWellHeader = settings.isOverwriteWellHeader;
                            moreUploadData.isCreateNewWellIfDupe = settings.isCreateNewWellIfDupe;
                            moreUploadData.isLoadAllCurves = settings.isLoadAllCurves;
                            moreUploadData.isUseUwiAsWellName = settings.isUseUwiAsWellName;
                            moreUploadData.isCreateNewDatasetIfDupe = settings.isCreateNewDatasetIfDupe;
                            let _list = fileWithFullInfo.file.filename.split('.');
                            if (/LAS/.test(_list[_list.length - 1].toUpperCase())) {
                                wiImport.setBasePath(config.curveBasePath);
                                wiImport.extractLAS2(fileWithFullInfo.file.path, moreUploadData, function (err, result) {
                                    if (err) {

                                    } else {
                                        //console.log(result);
                                        extractLAS2Done(result, {
                                            idProject: idProject,
                                            idDataset: fileWithFullInfo.datasetName,
                                            idWell: fileWithFullInfo.wellName,
                                            isString: true
                                        }, function (err, result) {
                                            if (err) {
                                                event.emit('done', err);
                                            } else {
                                                event.emit('done', result);
                                            }

                                        }, req.dbConnection);
                                    }
                                });
                            } else {
                                //not LAS files
                            }
                        }
                    });
                });
            }
        }, req.dbConnection);
    } else {
        res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'No file'));
    }
});
module.exports = router;
