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
let ResponseJSON = require('../response');
let importUntils = require('../import-untils/import-untils');
let bodyParser = require('body-parser');
let uploadModel = require('./upload.model');
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

function extractLAS2Done(result, options, callback, dbConnection) {
    //console.log(JSON.stringify(result));

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
        console.log("CREATE CURVES WITH PROJECT EXIST");
        importUntils.createCurvesWithProjectExist(projectInfo, wellInfo, datasetInfo[0], dbConnection).then(rs => {
            callback(false, rs);
        }).catch(err => {
            callback(err, null);
            console.log(err);
        });
    } else {
        wellInfo.idWell = options.idWell;
        if (!options.idDataset || options.idDataset == "") {
            console.log("CREATE CURVES WITH WELL EXIST");
            // importUntils.createCurvesWithWellExist(wellInfo, datasetInfo[0], {overwrite: false}).then(rs => {
            //     callback(false, rs);
            // }).catch(err => {
            //     callback(err, null);
            // });
            importUntils.createCurvesWithWellExistLAS3(wellInfo, datasetInfo, {overwrite: false}, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(false, result);
                }
            }, dbConnection);
        } else {
            datasetInfo[0].idDataset = options.idDataset;
            console.log("CREATE CURVES WITH DATASET EXIST");
            // importUntils.createCurvesWithDatasetExist(wellInfo, datasetInfo[0], curvesInfo, {overwrite: false}).then(rs => {
            //     callback(false, rs);
            // }).catch(err => {
            //     callback(err, null);
            // });
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

function extractLAS3Done(result, options, callback, dbConnection) {
    //console.log(result.datasetInfo[2].curves);
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
    let idProject = parseInt(req.body.id_project);
    let idWell = req.body.id_well ? parseInt(req.body.id_well) : 0;
    let idDataset = req.body.id_dataset ? parseInt(req.body.id_dataset) : 0;
    let wellName = req.body.well_name ? req.body.well_name : '';
    let datasetName = req.body.dataset_name ? req.body.dataset_name : '';
    let moreUploadData = new Object();
    moreUploadData.projectName = null;
    moreUploadData.wellName = null;
    moreUploadData.datasetName = null;
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
                                        console.log(JSON.stringify(result));
                                        extractLAS2Done(result, {
                                            idProject: idProject,
                                            idWell: idWell,
                                            idDataset: idDataset
                                        }, function (err, rs) {
                                            if (err) return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
                                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, rs)));
                                        }, req.dbConnection);
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
    //console.log(req.files);
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
        let owWellHeader = req.body.overide_well_header;
        let crWellDup = req.body.create_well_duplicate;
        let crDatasetDup = req.body.create_dataset_duplicate;
        let useUWI = req.body.use_uwi;
        let loadAllCurve = req.body.load_all_curve;
        let curves = req.body.families;
        let moreUploadData = new Object();
        moreUploadData.projectName = null;
        moreUploadData.wellName = null;
        moreUploadData.datasetName = null;
        moreUploadData.owWellHeader = null;
        moreUploadData.crWellDup = null;
        moreUploadData.crDatasetDup = null;
        moreUploadData.useUWI = null;
        // uploadModel.getProjectById(idProject, (err, projectName) => {
        //     if (!err) {
        //         moreUploadData.projectName = req.decoded.username + projectName;
        //         for (let i = 0; i < req.files.length; i++) {
        //             let list = req.files[i].filename.split('.');
        //             let fileFormat = list[list.length - 1];
        //             if (/LAS/.test(fileFormat.toUpperCase())) {
        //                 wiImport.setBasePath(config.curveBasePath);
        //                 wiImport.extractLAS2(req.files[i].path, moreUploadData, function (err, result) {
        //                     if (err) {
        //                         return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, err)));
        //                     }
        //                     else {
        //                         extractLAS2Done(result, {
        //                             idProject: idProject,
        //                             idWell: idWell[i],
        //                             idDataset: idDataset[i]
        //                         }, function (err, result) {
        //                             if (err) {
        //                                 event.emit('done', err);
        //                             } else {
        //                                 event.emit('done', result);
        //                             }
        //
        //                         }, req.dbConnection);
        //                     }
        //                 });
        //
        //             } else {
        //                 //another files
        //             }
        //         }
        //     }
        // }, req.dbConnection);

    } else {
        res.send(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'No file'));
    }
});

module.exports = router;
