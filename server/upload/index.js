'use strict';
const express = require('express');
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
let curvedata = require('../curve-data/curve-data.model');
let ResponseJSON = require('../response');
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

function createCurves(idDataset, curvesInfo, done) {
    let curvesResult = new Array();
    let object = null;
    async.each(curvesInfo, function (curveInfo, callback) {
        curveInfo.idDataset = parseInt(idDataset);
        curve.createNewCurve(curveInfo, function (result) {
            if (result.code == 200) {
                object = new Object();
                object = curveInfo;
                object.idCurve = result.content.idCurve;
                curvesResult.push(object);
                callback();
            }

            else {
                return done(result.code, null);
            }
        });
    }, function (err) {
        if (err) return done(err, null);
        else return done(false, curvesResult);
    });
}

function getWellInfo(section) {
    let wellInfo = {};
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
    return wellInfo;
}

function getCurveInfo(section, datasetKey) {
    let curvesInfo = new Array();
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
    return curvesInfo;
}

function getCurveDataInfo(section, idCurves) {
    let curvesDataInfo = new Array();
    section.content.forEach(function (curveInfo, i) {
        let curveDataInfo = new Object();
        curveDataInfo.idCurve = idCurves[i];
        curveDataInfo.name = curveInfo.name;
        curveDataInfo.unit = curveInfo.unit;
        curveDataInfo.description = curveInfo.description;
        curveDataInfo.path = curveInfo.data;
        curvesDataInfo.push(curveDataInfo);
    });
    return curvesDataInfo;
}

function createCurvesData(curvesDataInfo, done) {
    curvesDataInfo.forEach(function (curveDataInfo) {
        curvedata.createNewCurveData(curveDataInfo, function (result) {
            if(result.code == 200) {
                return done(result);
            }
            else {
                return done(result);
            }
        });
    });
}

router.post('/file', upload.single('file'), function (req, res) {
    console.log('-----------------------------');
    // TODO:
    // Check if req.body.id_project != undefined || null
    // Check if req.body.id_project is valid
    if (!req.body.id_project || req.body.id_project === "") {
        console.log("idProject undefined", req.body.id_project);
        return res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, 'idProject can not be null')));

    }

    let list = req.file.filename.split('.');
    let fileFormat = list[list.length - 1];
    if (/LAS/.test(fileFormat.toUpperCase())) {
        wiImport.extractLAS2(inDir + req.file.filename, function (result) {
            // if (!req.body.id_well)
            //      Tao well for idProject=req.body.id_project ==> idWell
            // else
            //      Khong tao well nua ma di check xem idWell co valid khong
            // Tao dataset & curves cho idWell = req.body.id_well (su dung noi dung trong "result")

            //createWellAndDatasetAndCurve(result, res, req);

            let wellInfo = null;
            let curvesInfo = null;
            let curvesDataInfo = null;
            let responseResult = new Object();
            let curveSection = null;
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
                    curveSection = section;
                    curvesInfo = getCurveInfo(section, wellInfo.name);
                }
            });
            datasetInfo.name = wellInfo.name;
            datasetInfo.datasetLabel = wellInfo.name;
            datasetInfo.datasetKey = wellInfo.name;
            if (!req.body.id_well || req.body.id_well === "") {
                wellInfo.idProject = parseInt(req.body.id_project);
                well.createNewWell(wellInfo, function (result) {
                    if (result.code == 200) {
                        //do something
                        // tao dataset && curves cho well
                        responseResult.well = wellInfo;
                        responseResult.well.idWell = result.content.idWell;
                        datasetInfo.idWell = result.content.idWell
                        if (!req.body.id_dataset || req.body.id_dataset === "") {
                            dataset.createNewDataset(datasetInfo, function (result) {
                                if (result.code == 200) {
                                    responseResult.well.dataset = datasetInfo;
                                    responseResult.well.dataset.idDataset = result.content.idDataset;
                                    if (curvesInfo) {
                                        createCurves(result.content.idDataset, curvesInfo, function (err, result) {
                                            if (err) {
                                                res.end(JSON.stringify(ResponseJSON(err, messageNotice.error)));

                                            }
                                            else {
                                                responseResult.well.dataset.curves = result;
                                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseResult)));
                                                // curvesDataInfo = getCurveDataInfo(curveSection, result);
                                                // createCurvesData(curvesDataInfo, function (result) {
                                                //     if(result.code != 200) {
                                                //         res.end(JSON.stringify(ResponseJSON(result, messageNotice.error)));
                                                //     }
                                                //     else {
                                                //         res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseResult)));
                                                //
                                                //     }
                                                // });

                                            }
                                        });
                                    }
                                }
                                else {
                                    //response err for client
                                    res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, result.content)));
                                }
                            });
                        }
                        else {
                            //create curves
                            let idDataset = req.body.id_dataset;
                            dataset.getDatasetInfo(idDataset, function (result) {
                                let datasetObject = new Object();
                                datasetObject.name = result.content.name;
                                datasetObject.datasetKey = result.content.datasetKey;
                                datasetObject.datasetLabel = result.content.datasetLabel;
                                responseResult.well.dataset = datasetObject;
                            });
                            if (curvesInfo) {
                                createCurves(req.body.id_dataset, curvesInfo, function (result) {
                                    if (err) {
                                        res.end(JSON.stringify(ResponseJSON(err, messageNotice.error)));
                                    }
                                    else {
                                        responseResult.well.dataset.curves = result;
                                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseResult)));
                                    }
                                });
                            }
                        }
                    }

                    else {
                        // response error for client'
                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, result.content)));
                    }
                });
            }
            else {
                //do something
                //tao dataset %% curves for well exist
                datasetInfo.idWell = req.body.id_well;
                let idWell = parseInt(req.body.id_well);
                well.getWellInfo(idWell, function (result) {
                    let wellObject = new Object();
                    wellObject.idWell = idWell;
                    wellObject.name = result.content.name;
                    wellObject.topDepth = result.content.topDepth;
                    wellObject.bottomDepth = result.content.bottomDepth;
                    wellObject.step = result.content.step;
                    responseResult.well = wellObject;
                });
                if (!req.body.id_dataset || req.body.id_dataset === "") {
                    dataset.createNewDataset(datasetInfo, function (result) {
                        if (result.code == 200) {
                            responseResult.well.dataset = datasetInfo;
                            responseResult.well.dataset.idDataset = result.content.idDataset;
                            if (curvesInfo) {
                                createCurves(result.content.idDataset, curvesInfo, function (err, result) {
                                    if (err) {
                                        res.end(JSON.stringify(ResponseJSON(err, messageNotice.error)));

                                    }
                                    else {
                                        responseResult.well.dataset.curves = result;
                                        res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseResult)));
                                        // curvesDataInfo = getCurveDataInfo(curveSection, result);
                                        // createCurvesData(curvesDataInfo, function (result) {
                                        //     if(result.code != 200) {
                                        //         res.end(JSON.stringify(ResponseJSON(result, messageNotice.error)));
                                        //     }
                                        //     else {
                                        //         res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseResult)));
                                        //
                                        //     }
                                        // });

                                    }
                                });
                            }
                        }
                        else {
                            //response err for client
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error, result.content)));
                        }
                    });
                }
                else {
                    //create curves
                    let idDataset = req.body.id_dataset;
                    dataset.getDatasetInfo(idDataset, function (result) {
                        let datasetObject = new Object();
                        datasetObject.name = result.content.name;
                        datasetObject.datasetKey = result.content.datasetKey;
                        datasetObject.datasetLabel = result.content.datasetLabel;
                        responseResult.well.dataset = datasetObject;
                    });
                    if (curvesInfo) {
                        createCurves(req.body.id_dataset, curvesInfo, function (err,result) {
                            if (err) {
                                res.end(JSON.stringify(ResponseJSON(err, messageNotice.error)));
                            }
                            else {
                                responseResult.well.dataset.curves = result;
                                res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, responseResult)));
                            }
                        });
                    }
                }
            }

            //res.end(JSON.stringify(result, null, 2));
        }, {
            projectId: parseInt(req.body.id_project),
            wellId: "someWellId",
            label: 'datasetLabel'
        });
    }


    else if (/ASC/.test(fileFormat.toUpperCase())) {
        wiImport.extractASC(inDir + req.file.filename, 'idProject', 'idWell', function (result) {
            //do something with result
        });
    }
    else if (/CSV/.test(fileFormat.toUpperCase())) {
        wiImport.extractCSV(inDir + req.file.filename, 'idProject', 'idWell');
    }
    //return res.end(JSON.stringify(req.file));
}); //done

module.exports = router;