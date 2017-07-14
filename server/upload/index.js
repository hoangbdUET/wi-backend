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
            let curvesDataInfo = null;
            let responseResult = new Object();
            let curveSection = null;

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
                            console.log('resulr');
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.SUCCESS, messageNotice.success, result)));
                        })
                        .catch(function (err) {
                            console.log('error la ', err);
                            res.end(JSON.stringify(ResponseJSON(errorCodes.CODES.ERROR_INVALID_PARAMS, messageNotice.error,err)));
                        })
                }
                else {
                    //create curves
                    datasetInfo = new Object();
                    datasetInfo.id_dataset = parseInt(req.body.id_dataset);
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


    else if (/ASC/.test(fileFormat.toUpperCase())) {
        wiImport.extractASC(inDir + req.file.filename, 'idProject', 'idWell', function (result) {
            //do something with result
        });
    }
    else if (/CSV/.test(fileFormat.toUpperCase())) {
        wiImport.extractCSV(inDir + req.file.filename, 'idProject', 'idWell');
    }
    //return res.end(JSON.stringify(req.file));
});

module.exports = router;