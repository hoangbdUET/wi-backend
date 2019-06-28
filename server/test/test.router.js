"use strict";

let ErrorCodes = require('../../error-codes').CODES;
const ResponseJSON = require('../response');
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let fs = require('fs');
router.use(bodyParser.json());
const extractArr = require('./extract-attr');
const Transporter = require('./transporter.model');

router.post('/clone-project',async (req, res)=>{
    let payload = req.body;
    let dbConnection = req.dbConnection;
    
    let project = {};
    project.info = {};
    let infoProject = await dbConnection.Project.findByPk(payload.idProject);
    if (!infoProject) {
        res.json(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Project not found"));
        return;
    }
    project.info = infoProject.dataValues;
    let checkIdProject = {
        where: {
            idProject: payload.idProject
        }
    };


    //EVERYTHING IN PROJECT
    project.wells = await dbConnection.Well.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.plots = await dbConnection.Plot.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.crossPlots = await dbConnection.CrossPlot.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.histograms = await dbConnection.Histogram.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.combinedBoxs = await dbConnection.CombinedBox.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.zoneSetTemplates = await dbConnection.ZoneSetTemplate.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.workFlows = await dbConnection.Workflow.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.parameterSets = await dbConnection.ParameterSet.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.flows = await dbConnection.Flow.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.markerSetTemplates = await dbConnection.MarkerSetTemplate.findAll(checkIdProject)
    .map(v => v.dataValues);
    project.analysis = await dbConnection.Analysis.findAll(checkIdProject)
    .map(v => v.dataValues);

    project.tasks = [];
    for (let i in project.flows) {
        let checkIdFlow = {
            where: {
                idFlow: project.flows[i].idFlow
            }
        };
        let result = await dbConnection.Task.findAll(checkIdFlow);
        for (let j in result) {
            project.tasks.push(result[j].dataValues);
        }
    }

    project.datasets = [];
    project.wellheaders = [];
    project.zoneSets = [];
    project.imageSets = [];
    project.markerSets = [];
    //EVERYTHING IN WELL
    for (let i in project.wells) {
        let checkIdWell = {
            where: {
                idWell: project.wells[i].idWell
            }
        };
        let result = await dbConnection.Dataset.findAll(checkIdWell);
        for (let j in result) {
            project.datasets.push(result[j].dataValues);
        }
        result = await dbConnection.WellHeader.findAll(checkIdWell);
        for (let j in result) {
            project.wellheaders.push(result[j].dataValues);
        }
        result = await dbConnection.ZoneSet.findAll(checkIdWell);
        for (let j in result) {
            project.zoneSets.push(result[j].dataValues);
        }
        result = await dbConnection.ImageSet.findAll(checkIdWell);
        for (let j in result) {
            project.imageSets.push(result[j].dataValues);
        }
        result = await dbConnection.MarkerSet.findAll(checkIdWell);
        for (let j in result) {
            project.markerSets.push(result[j].dataValues);
        }
    }

    project.curves = [];
    project.datasetParams = [];
    //EVERYTHING IN DATASET
    for (let i in project.datasets) {
        let checkIdDataset = {
            where: {
                idDataset: project.datasets[i].idDataset
            }
        };
        let result = await dbConnection.Curve.findAll(checkIdDataset);
        for (let j in result) {
            project.curves.push(result[j].dataValues);
        }
        result = await dbConnection.DatasetParams.findAll(checkIdDataset);
        for (let j in result) {
            project.datasetParams.push(result[j].dataValues);
        }
    }

    //EVERYTHING IN PLOT
    project.tracks = [];
    project.depthAxis = [];
    project.imageTracks = [];
    project.objectTracks = [];
    project.zoneTracks = [];
    for (let i in project.plots) {
        let checkIdPlot = {
            where: {
                idPlot: project.plots[i].idPlot
            }
        };
        let result = await dbConnection.Track.findAll(checkIdPlot);
        for (let j in result) {
            project.tracks.push(result[j].dataValues);
        }
        result = await dbConnection.DepthAxis.findAll(checkIdPlot);
        for (let j in result) {
            project.depthAxis.push(result[j].dataValues);
        }
        result = await dbConnection.ImageTrack.findAll(checkIdPlot);
        for (let j in result) {
            project.imageTracks.push(result[j].dataValues);
        }
        result = await dbConnection.ObjectTrack.findAll(checkIdPlot);
        for (let j in result) {
            project.objectTracks.push(result[j].dataValues);
        }
        result = await dbConnection.ZoneTrack.findAll(checkIdPlot);
        for (let j in result) {
            project.zoneTracks.push(result[j].dataValues);
        }
    }

    project.zoneTemplates = [];
    for (let i in project.zoneSetTemplates) {
        let checkIdZoneSetTemplate = {
            where: {
                idZoneSetTemplate: project.zoneSetTemplates[i].idZoneSetTemplate
            }
        };
        let result = await dbConnection.ZoneTemplate.findAll(checkIdZoneSetTemplate);
        for (let j in result) {
            project.zoneTemplates.push(result[j].dataValues);
        }
    }
    project.zones = [];
    for (let i in project.zoneSets) {
        let checkIdZoneSet = {
            where: {
                idZoneSet: project.zoneSets[i].idZoneSet
            }
        };
        let result = await dbConnection.Zone.findAll(checkIdZoneSet);
        for (let j in result) {
            project.zones.push(result[j].dataValues);
        }
    }
    
    project.lines = [];
    project.shadings = [];
    project.annotations = [];

    for (let i in project.tracks) {
        let checkIdTrack = {
            where: {
                idTrack: project.tracks[i].idTrack
            }
        };
        let result = await dbConnection.Line.findAll(checkIdTrack);
        for (let j in result) {
            project.lines.push(result[j].dataValues);
        }
        result = await dbConnection.Shading.findAll(checkIdTrack);
        for (let j in result) {
            project.shadings.push(result[j].dataValues);
        }
        result = await dbConnection.Annotation.findAll(checkIdTrack);
        for (let j in result) {
            project.annotations.push(result[j].dataValues);
        }
    }

    project.referenceCurves = [];
    project.ternarys = [];
    project.pointSets = [];
    project.userDefineLines = [];
    project.polygons = [];
    project.regressionLines = [];
    for (let i in project.crossPlots) {
        let checkIdCrossPlot = {
            where: {
                idCrossPlot: project.crossPlots[i].idCrossPlot
            }
        };
        let result = await dbConnection.ReferenceCurve.findAll(checkIdCrossPlot);
        for (let j in result) {
            project.referenceCurves.push(result[j].dataValues);
        }
        result = await dbConnection.Ternary.findAll(checkIdCrossPlot);
        for (let j in result) {
            project.ternarys.push(result[j].dataValues);
        }
        result = await dbConnection.PointSet.findAll(checkIdCrossPlot);
        for (let j in result) {
            project.pointSets.push(result[j].dataValues);
        }
        result = await dbConnection.UserDefineLine.findAll(checkIdCrossPlot);
        for (let j in result) {
            project.userDefineLines.push(result[j].dataValues);
        }
        result = await dbConnection.Polygon.findAll(checkIdCrossPlot);
        for (let j in result) {
            project.polygons.push(result[j].dataValues);
        }
        result = await dbConnection.RegressionLine.findAll(checkIdCrossPlot);
        for (let j in result) {
            project.regressionLines.push(result[j].dataValues);
        }
    }
    
    project.images = [];
    for (let i in project.imageSets) {
        let checkIdImageSet = {
            where: {
                idImageSet: project.imageSets[i].idImageSet
            }
        };
        let result = await dbConnection.Image.findAll(checkIdImageSet);
        for (let j in result) {
            project.images.push(result[j].dataValues);
        }
    }

    project.markers = [];
    for (let i in project.markerSets) {
        let checkIdMarkerSet = {
            where: {
                idMarkerSet: project.markerSets[i].idMarkerSet
            }
        };
        let result = await dbConnection.Marker.findAll(checkIdMarkerSet);
        for (let j in result) {
            project.markers.push(result[j].dataValues);
        }
    }

    project.combinedBoxTools = [];
    project.selectionTools = [];
    for (let i in project.combinedBox) {
        let checkIdCombinedBox = {
            where: {
                idCombinedBox: project.combinedBoxs[i].idCombinedBox
            }
        };
        let result = await dbConnection.CombinedBoxTool.findAll(checkIdCombinedBox);
        for (let j in result) {
            project.combinedBoxTools.push(result[j].dataValues);
        }
        result = await dbConnection.SelectionTool.findAll(checkIdCombinedBox);
        for (let j in result) {
            project.selectionTools.push(result[j].dataValues);
        }
    }

    project.markerTemplates = [];
    for (let i in project.markerSetTemplates) {
        let checkIdMarkerSetTemplates = {
            where: {
                idMarkerSetTemplate: project.markerSetTemplates[i].idMarkerSetTemplate
            }
        };
        let result = await dbConnection.MarkerTemplate.findAll(checkIdMarkerSetTemplates);
        for (let j in result) {
            project.markerTemplates.push(result[j].dataValues);
        }
    }

    
    fs.writeFile('project.export.json', JSON.stringify(project));
    res.json(project);
});


router.post('/apply-clone-project', async (req, res) => {
    let project = JSON.parse(fs.readFileSync('project.export.json', 'utf8'));
    let dbConnection = req.dbConnection;
    let transporter = new Transporter();
    
    //save project
    let oldId = project.info.idProject;
    delete project.info.idProject;
    
    try {
        let rs = await dbConnection.Project.create(project.info);
        let newId = rs.idProject;
        transporter.updateTransTable('idProject', oldId, newId);
    } catch (err) {
        res.json({reason: 'PROJECT NAME EXISTED'});
        return;
    }

    let n = project.wells.length;
    for (let i = 0; i < n; i++) {
        let well = project.wells[i];
        let oldId = well.idWell;
        delete well.idWell;
        try {
            let rs = await dbConnection.Well.create(transporter.transData(well));
            transporter.updateTransTable('idWell', oldId, rs.idWell);
        } catch (err) {
            continue;
        }
    }

    n = project.datasets.length;
    for (let i = 0; i < n; i++) {
        let dataset = project.datasets[i];
        let oldId = dataset.idDataset;
        delete dataset.idDataset;
        try {
            let rs = await dbConnection.Dataset.create(transporter.transData(dataset));
            transporter.updateTransTable('idDataset', oldId, rs.idDataset);
        } catch (err) {
            continue;
        }
    }

    n = project.curves.length;
    for (let i = 0; i < n; i++) {
        let curve = project.curves[i];
        let oldId = curve.idCurve;
        delete curve.idCurve;
        try {
            let rs = await dbConnection.Curve.create(transporter.transData(curve));
            transporter.updateTransTable('idCurve', oldId, rs.idCurve);
            transporter.updateTransTable('idControlCurve', oldId, rs.idCurve);
            transporter.updateTransTable('idCurveX', oldId, rs.idCurve);
            transporter.updateTransTable('idCurveY', oldId, rs.idCurve);
            transporter.updateTransTable('idCurveZ', oldId, rs.idCurve);
            transporter.updateTransTable('idCurveZ1', oldId, rs.idCurve);
            transporter.updateTransTable('idCurveZ2', oldId, rs.idCurve);
            transporter.updateTransTable('idCurveZ3', oldId, rs.idCurve);
            transporter.updateTransTable('referenceCurve', oldId, rs.idCurve);

        } catch (err) {
            continue;
        }
    }

    n = project.plots.length;
    for (let i = 0; i < n; i++) {
        let j = project.plots[i];
        let oldId = j.idPlot;
        delete j.idPlot;
        try {
            let rs = await dbConnection.Plot.create(transporter.transData(j));
            transporter.updateTransTable('idPlot', oldId, rs.idPlot);
        } catch (err) {
            continue;
        }
    }

    n = project.wellheaders.length;
    for (let i = 0; i < n; i++) {
        let j = project.wellheaders[i];
        let oldId = j.idWellHeader;
        delete j.idWellHeader;
        try {
            let rs = await dbConnection.WellHeader.create(transporter.transData(j));
            transporter.updateTransTable('idWellHeader', oldId, rs.idWellHeader);
        } catch (err) {
            continue;
        }
    }
    
    n = project.wellheaders.length;
    for (let i = 0; i < n; i++) {
        let j = project.wellheaders[i];
        let oldId = j.idWellHeader;
        delete j.idWellHeader;
        try {
            let rs = await dbConnection.WellHeader.create(transporter.transData(j));
            transporter.updateTransTable('idWellHeader', oldId, rs.idWellHeader);
        } catch (err) {
            continue;
        }
    }

    n = project.datasetParams.length;
    for (let i = 0; i < n; i++) {
        let j = project.datasetParams[i];
        let oldId = j.idDatasetParam;
        delete j.idDatasetParam;
        try {
            let rs = await dbConnection.DatasetParam.create(transporter.transData(j));
            transporter.updateTransTable('idDatasetParam', oldId, rs.idDatasetParam);
        } catch (err) {
            continue;
        }
    }

    n = project.crossPlots.length;
    for (let i = 0; i < n; i++) {
        let j = project.crossPlots[i];
        let oldId = j.idCrossPlot;
        delete j.idCrossPlot;
        try {
            let rs = await dbConnection.CrossPlot.create(transporter.transData(j));
            transporter.updateTransTable('idCrossPlot', oldId, rs.idCrossPlot);
        } catch (err) {
            continue;
        }
    }

    n = project.zoneSetTemplates.length;
    for (let i = 0; i < n; i++) {
        let j = project.zoneSetTemplates[i];
        let oldId = j.idZoneSetTemplate;
        delete j.idZoneSetTemplate;
        try {
            let rs = await dbConnection.ZoneSetTemplate.create(transporter.transData(j));
            transporter.updateTransTable('idZoneSetTemplate', oldId, rs.idZoneSetTemplate);
        } catch (err) {
            continue;
        }
    }

    n = project.zoneTemplates.length;
    for (let i = 0; i < n; i++) {
        let j = project.zoneTemplates[i];
        let oldId = j.idZoneTemplate;
        delete j.idZoneTemplate;
        try {
            let rs = await dbConnection.ZoneTemplate.create(transporter.transData(j));
            transporter.updateTransTable('idZoneTemplate', oldId, rs.idZoneTemplate);
        } catch (err) {
            continue;
        }
    }

    n = project.zoneSets.length;
    for (let i = 0; i < n; i++) {
        let j = project.zoneSets[i];
        let oldId = j.idZoneSet;
        delete j.idZoneSet;
        try {
            let rs = await dbConnection.ZoneSet.create(transporter.transData(j));
            transporter.updateTransTable('idZoneSet', oldId, rs.idZoneSet);
        } catch (err) {
            continue;
        }
    }

    n = project.zones.length;
    for (let i = 0; i < n; i++) {
        let j = project.zones[i];
        let oldId = j.idZone;
        delete j.idZone;
        try {
            let rs = await dbConnection.Zone.create(transporter.transData(j));
            transporter.updateTransTable('idZone', oldId, rs.idZone);
        } catch (err) {
            continue;
        }
    }

    n = project.markerSetTemplates.length;
    for (let i = 0; i < n; i++) {
        let j = project.markerSetTemplates[i];
        let oldId = j.idMarkerSetTemplate;
        delete j.idMarkerSetTemplate;
        try {
            let rs = await dbConnection.MarkerSetTemplate.create(transporter.transData(j));
            transporter.updateTransTable('idMarkerSetTemplate', oldId, rs.idMarkerSetTemplate);
        } catch (err) {
            continue;
        }
    }

    n = project.markerTemplates.length;
    for (let i = 0; i < n; i++) {
        let j = project.markerTemplates[i];
        let oldId = j.idMarkerTemplate;
        delete j.idMarkerTemplate;
        try {
            let rs = await dbConnection.MarkerTemplate.create(transporter.transData(j));
            transporter.updateTransTable('idMarkerTemplate', oldId, rs.idMarkerTemplate);
        } catch (err) {
            continue;
        }
    }

    n = project.markerSets.length;
    for (let i = 0; i < n; i++) {
        let j = project.markerSets[i];
        let oldId = j.idMarkerSet;
        delete j.idMarkerSet;
        try {
            let rs = await dbConnection.MarkerSet.create(transporter.transData(j));
            transporter.updateTransTable('idMarkerSet', oldId, rs.idMarkerSet);
        } catch (err) {
            continue;
        }
    }

    n = project.markers.length;
    for (let i = 0; i < n; i++) {
        let j = project.markers[i];
        let oldId = j.idMarker;
        delete j.idMarker;
        try {
            let rs = await dbConnection.Marker.create(transporter.transData(j));
            transporter.updateTransTable('idMarker', oldId, rs.idMarker);
        } catch (err) {
            continue;
        }
    }

    n = project.histograms.length;
    for (let i = 0; i < n; i++) {
        let j = project.histograms[i];
        let oldId = j.idHistogram;
        delete j.idHistogram;
        try {
            let rs = await dbConnection.Histogram.create(transporter.transData(j));
            transporter.updateTransTable('idHistogram', oldId, rs.idHistogram);
        } catch (err) {
            continue;
        }
    }

    n = project.combinedBoxs.length;
    for (let i = 0; i < n; i++) {
        let j = project.combinedBoxs[i];
        let oldId = j.idCombinedBox;
        delete j.idCombinedBox;
        try {
            let rs = await dbConnection.CombinedBox.create(transporter.transData(j));
            transporter.updateTransTable('idCombinedBox', oldId, rs.idCombinedBox);
        } catch (err) {
            continue;
        }
    }

    n = project.workFlows.length;
    for (let i = 0; i < n; i++) {
        let j = project.workFlows[i];
        let oldId = j.idWorkFlow;
        delete j.idWorkFlow;
        try {
            let rs = await dbConnection.WorkFlow.create(transporter.transData(j));
            transporter.updateTransTable('idWorkFlow', oldId, rs.idWorkFlow);
        } catch (err) {
            continue;
        }
    }

    n = project.parameterSets.length;
    for (let i = 0; i < n; i++) {
        let j = project.parameterSets[i];
        let oldId = j.idParameterSet;
        delete j.idParameterSet;
        try {
            let rs = await dbConnection.ParameterSet.create(transporter.transData(j));
            transporter.updateTransTable('idParameterSet', oldId, rs.idParameterSet);
        } catch (err) {
            continue;
        }
    }

    n = project.flows.length;
    for (let i = 0; i < n; i++) {
        let j = project.flows[i];
        let oldId = j.idFlow;
        delete j.idFlow;
        try {
            let rs = await dbConnection.Flow.create(transporter.transData(j));
            transporter.updateTransTable('idFlow', oldId, rs.idFlow);
        } catch (err) {
            continue;
        }
    }

    n = project.analysis.length;
    for (let i = 0; i < n; i++) {
        let j = project.analysis[i];
        let oldId = j.idAnalysis;
        delete j.idAnalysis;
        try {
            let rs = await dbConnection.Analysis.create(transporter.transData(j));
            transporter.updateTransTable('idAnalysis', oldId, rs.idAnalysis);
        } catch (err) {
            continue;
        }
    }

    n = project.tracks.length;
    for (let i = 0; i < n; i++) {
        let j = project.tracks[i];
        let oldId = j.idTrack;
        delete j.idTrack;
        try {
            let rs = await dbConnection.Track.create(transporter.transData(j));
            transporter.updateTransTable('idTrack', oldId, rs.idTrack);
        } catch (err) {
            continue;
        }
    }

    n = project.depthAxis.length;
    for (let i = 0; i < n; i++) {
        let j = project.depthAxis[i];
        let oldId = j.idDepthAxis;
        delete j.idDepthAxis;
        try {
            let rs = await dbConnection.DepthAxis.create(transporter.transData(j));
            transporter.updateTransTable('idDepthAxis', oldId, rs.idDepthAxis);
        } catch (err) {
            continue;
        }
    }

    n = project.imageTracks.length;
    for (let i = 0; i < n; i++) {
        let j = project.imageTracks[i];
        let oldId = j.idImageTrack;
        delete j.idImageTrack;
        try {
            let rs = await dbConnection.ImageTrack.create(transporter.transData(j));
            transporter.updateTransTable('idImageTrack', oldId, rs.idImageTrack);
        } catch (err) {
            continue;
        }
    }

    n = project.objectTracks.length;
    for (let i = 0; i < n; i++) {
        let j = project.objectTracks[i];
        let oldId = j.idObjectTrack;
        delete j.idObjectTrack;
        try {
            let rs = await dbConnection.ObjectTrack.create(transporter.transData(j));
            transporter.updateTransTable('idObjectTrack', oldId, rs.idObjectTrack);
        } catch (err) {
            continue;
        }
    }

    n = project.zoneTracks.length;
    for (let i = 0; i < n; i++) {
        let j = project.zoneTracks[i];
        let oldId = j.idZoneTrack;
        delete j.idZoneTrack;
        try {
            let rs = await dbConnection.ZoneTrack.create(transporter.transData(j));
            transporter.updateTransTable('idZoneTrack', oldId, rs.idZoneTrack);
        } catch (err) {
            continue;
        }
    }

    n = project.lines.length;
    for (let i = 0; i < n; i++) {
        let j = project.lines[i];
        let oldId = j.idLine;
        delete j.idLine;
        try {
            let rs = await dbConnection.Line.create(transporter.transData(j));
            transporter.updateTransTable('idLine', oldId, rs.idLine);
            transporter.updateTransTable('idLeftLine', oldId, rs.idLine);
            transporter.updateTransTable('idRightLine', oldId, rs.idLine);
        } catch (err) {
            continue;
        }
    }

    n = project.shadings.length;
    for (let i = 0; i < n; i++) {
        let j = project.shadings[i];
        let oldId = j.idShading;
        delete j.idShading;
        try {
            let rs = await dbConnection.Shading.create(transporter.transData(j));
            transporter.updateTransTable('idShading', oldId, rs.idShading);
        } catch (err) {
            continue;
        }
    }

    n = project.annotations.length;
    for (let i = 0; i < n; i++) {
        let j = project.annotations[i];
        let oldId = j.idAnnotation;
        delete j.idAnnotation;
        try {
            let rs = await dbConnection.Annotation.create(transporter.transData(j));
            transporter.updateTransTable('idAnnotation', oldId, rs.idAnnotation);
        } catch (err) {
            continue;
        }
    }

    n = project.referenceCurves.length;
    for (let i = 0; i < n; i++) {
        let j = project.referenceCurves[i];
        let oldId = j.idReferenceCurve;
        delete j.idReferenceCurve;
        try {
            let rs = await dbConnection.ReferenceCurve.create(transporter.transData(j));
            transporter.updateTransTable('idReferenceCurve', oldId, rs.idReferenceCurve);
        } catch (err) {
            continue;
        }
    }

    n = project.ternarys.length;
    for (let i = 0; i < n; i++) {
        let j = project.ternarys[i];
        let oldId = j.idTernary;
        delete j.idTernary;
        try {
            let rs = await dbConnection.Ternary.create(transporter.transData(j));
            transporter.updateTransTable('idTernary', oldId, rs.idTernary);
        } catch (err) {
            continue;
        }
    }

    n = project.pointSets.length;
    for (let i = 0; i < n; i++) {
        let j = project.pointSets[i];
        let oldId = j.idPointSet;
        delete j.idPointSet;
        try {
            let rs = await dbConnection.PointSet.create(transporter.transData(j));
            transporter.updateTransTable('idPointSet', oldId, rs.idPointSet);
        } catch (err) {
            continue;
        }
    }

    n = project.combinedBoxTools.length;
    for (let i = 0; i < n; i++) {
        let j = project.combinedBoxTools[i];
        let oldId = j.idCombinedBoxTool;
        delete j.idCombinedBoxTool;
        try {
            let rs = await dbConnection.CombinedBoxTool.create(transporter.transData(j));
            transporter.updateTransTable('idCombinedBoxTool', oldId, rs.idCombinedBoxTool);
        } catch (err) {
            continue;
        }
    }

    n = project.selectionTools.length;
    for (let i = 0; i < n; i++) {
        let j = project.selectionTools[i];
        let oldId = j.idSelectionTool;
        delete j.idSelectionTool;
        try {
            let rs = await dbConnection.SelectionTool.create(transporter.transData(j));
            transporter.updateTransTable('idSelectionTool', oldId, rs.idSelectionTool);
        } catch (err) {
            continue;
        }
    }

    n = project.pointSets.length;
    for (let i = 0; i < n; i++) {
        let j = project.pointSets[i];
        let oldId = j.idPointSet;
        delete j.idPointSet;
        try {
            let rs = await dbConnection.PointSet.create(transporter.transData(j));
            transporter.updateTransTable('idPointSet', oldId, rs.idPointSet);
        } catch (err) {
            continue;
        }
    }

    n = project.userDefineLines.length;
    for (let i = 0; i < n; i++) {
        let j = project.userDefineLines[i];
        let oldId = j.idUserDefineLine;
        delete j.idUserDefineLine;
        try {
            let rs = await dbConnection.UserDefineLine.create(transporter.transData(j));
            transporter.updateTransTable('idUserDefineLine', oldId, rs.idUserDefineLine);
        } catch (err) {
            continue;
        }
    }

    n = project.polygons.length;
    for (let i = 0; i < n; i++) {
        let j = project.polygons[i];
        let oldId = j.idPolygon;
        delete j.idPolygon;
        try {
            let rs = await dbConnection.Polygon.create(transporter.transData(j));
            transporter.updateTransTable('idPolygon', oldId, rs.idPolygon);
        } catch (err) {
            continue;
        }
    }

    n = project.regressionLines.length;
    for (let i = 0; i < n; i++) {
        let j = project.regressionLines[i];
        let oldId = j.idRegressionLine;
        delete j.idRegressionLine;
        try {
            let rs = await dbConnection.RegressionLine.create(transporter.transData(j));
            transporter.updateTransTable('idRegressionLine', oldId, rs.idRegressionLine);
        } catch (err) {
            continue;
        }
    }
    
    n = project.images.length;
    for (let i = 0; i < n; i++) {
        let j = project.images[i];
        let oldId = j.idImage;
        delete j.idImage;
        try {
            let rs = await dbConnection.Image.create(transporter.transData(j));
            transporter.updateTransTable('idImage', oldId, rs.idImage);
        } catch (err) {
            continue;
        }
    }

    res.json(project);

});



module.exports = router;