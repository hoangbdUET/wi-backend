'use strict';
const express = require('express');
const multer  = require('multer');
const cors = require('cors');
var router = express.Router();
let inDir = __dirname + '/../../uploads/';
let wiImport = require('wi-import');
let errorCode = require('../../error-codes');
let well = require('../well/well.model');
let dataset = require('../dataset/dataset.model');
let curve = require('../curve/curve.model');
let messageNotice = {
    error:'Import Error',
    success:'Import Success'
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

var upload = multer({ storage: storage });

function createCurves(idDataset, curvesInfo, done) {
    curvesInfo.forEach(function (curveInfo) {
        curveInfo.idDataset = parseInt(idDataset);
        curve.createNewCurve(curveInfo,function (result) {
            if(result.code == 200) {
                done(result);
            }
            else {
                done(result);
            }
        });
    });

}

function createWellAndDatasetAndCurve(result, res, req) {
    let wellInfo = {
        idProject: null,
        name:"",
        topDepth:"",
        bottomDepth: "",
        step:""
    };
    let datasetInfo = {
        idWell:null,
        name:"",
        datasetKey:"",
        datasetLabel: ""
    };
    let curveInfo = new Object();
    let curvesInfo = new Array();
    result.forEach(function (section) {
        if(/~WELL/g.test(section.name)) {
            section.content.forEach(function (item) {
                if(/STRT/g.test(item.name.toUpperCase())) {
                    wellInfo.topDepth = item.data;
                }
                if(/STOP/g.test(item.name.toUpperCase())) {
                    wellInfo.bottomDepth = item.data;
                }
                if(/STEP/g.test(item.name.toUpperCase())) {
                    wellInfo.step = item.data;
                }
                if(/WELL/g.test(item.name.toUpperCase())) {
                    wellInfo.name = item.data;
                    datasetInfo.name = item.data;
                    datasetInfo.datasetKey = item.data;
                    datasetInfo.datasetLabel = item.data;
                }
            })
        }
        else if(/~CURVE/g.test(section.name)) {
            section.content.forEach(function (item) {
                curveInfo.name = item.name;
                curveInfo.unit = item.unit;
                curveInfo.initValue = "abc";
                curveInfo.family = "VNU";
                curveInfo.dataset = datasetInfo.datasetKey;
                curveInfo.idDataset = null;
                curvesInfo.push(curveInfo);
                curveInfo = new Object();
            });
        }
    });
    if(!req.body.id_well || req.body.id_well === "") {
        wellInfo.idProject = parseInt(req.body.id_project);
        well.createNewWell(wellInfo,function (result) {
            if(result.code == 200) {
                //do something
                // tao dataset && curves cho well
                datasetInfo.idWell = result.content.idWell
                if(!req.body.id_dataset || req.body.id_dataset === "") {
                    dataset.createNewDataset(datasetInfo, function (result) {
                        if(result.code == 200) {
                            if(curvesInfo) {
                                createCurves(result.content.idDataset, curvesInfo, function (result) {
                                    res.end(JSON.stringify(result) + messageNotice.success);
                                });
                            }
                        }
                        else {
                            //response err for client
                            return res.end(JSON.stringify(result) + messageNotice.error);
                        }
                    });
                }
                else {
                    //create curves
                    if(curvesInfo) {
                        createCurves(req.body.id_dataset, curvesInfo, function (result) {
                            res.end(JSON.stringify(result)+ messageNotice.success);
                        });
                    }
                }
            }

            else {
                // response error for client
                res.end(JSON.stringify(result) + messageNotice.error);
            }
        });
    }

    else {
        //do something
        //tao dataset %% curves for well exist
        datasetInfo.idWell = req.body.id_well;
        if(!req.body.id_dataset || req.body.id_dataset === "") {
            dataset.createNewDataset(datasetInfo, function (result) {
                if(result.code == 200) {
                    if(curvesInfo) {
                        createCurves(result.content.idDataset, curvesInfo, function (result) {
                            res.end(JSON.stringify(result) + messageNotice.success);
                        });
                    }
                }
                else {
                    //response err for client
                    res.end(JSON.stringify(result) + messageNotice.error);
                }
            });
        }
        else {
            //create curves
            if(curvesInfo) {
                createCurves(req.body.id_dataset, curvesInfo, function (result) {
                    res.end(JSON.stringify(result) + messageNotice.error);
                });
            }
        }
    }
}

router.post('/file', upload.single('file'), function (req, res) {
    console.log('-----------------------------');
    // TODO:
    // Check if req.body.id_project != undefined || null
    // Check if req.body.id_project is valid
    if(!req.body.id_project || req.body.id_project === "") {
        console.log("idProject undefined");
        return res.end(errorCode.CODES.ERROR_INVALID_PARAMS,'idProject can not be null');

    }

    let list = req.file.filename.split('.');
    let fileFormat = list[list.length - 1];
    if(/LAS/.test(fileFormat.toUpperCase())) {
        wiImport.extractLAS2(inDir + req.file.filename, function (result) {

            // if (!req.body.id_well)
            //      Tao well for idProject=req.body.id_project ==> idWell
            // else
            //      Khong tao well nua ma di check xem idWell co valid khong
            // Tao dataset & curves cho idWell = req.body.id_well (su dung noi dung trong "result")

            createWellAndDatasetAndCurve(result, res, req);

            //res.end(JSON.stringify(result, null, 2));
        }, {
            projectId: parseInt(req.body.id_project),
            wellId: "someWellId",
            label: 'datasetLabel'
        });
    }


    else if(/ASC/.test(fileFormat.toUpperCase())) {
        wiImport.extractASC(inDir + req.file.filename, 'idProject', 'idWell', function (result) {
            //do something with result
        });
    }
    else if(/CSV/.test(fileFormat.toUpperCase())) {
        wiImport.extractCSV(inDir + req.file.filename, 'idProject', 'idWell');
    }
    //return res.end(JSON.stringify(req.file));
}); //done

module.exports = router;