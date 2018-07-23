const express = require('express');
const router = express.Router();
const ResponseJSON = require('../response');
const ErrorCodes = require('../../error-codes').CODES;
let syncModel = require('../database/sync-master-to-user');

router.post('/zone-template', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done Zone Templates", "Done Zone Templates"));
        }
    }, 'zone_template');
});

router.post('/marker-template', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done Marker Templates", "Done Marker Templates"));
        }
    }, 'marker_template');
});

router.post('/family', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done Marker Templates", "Done Marker Templates"));
        }
    }, 'family');
});

router.post('/overlay-line', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done Overlay Lines", "Done Overlay Lines"));
        }
    }, 'overlay_line');
});

router.post('/workflow-spec', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done Workflow Specs", "Done Workflow Specs"));
        }
    }, 'workflow_spec');
});

router.post('/task-spec', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done Task Specs", "Done Task Specs"));
        }
    }, 'task_spec');
});

router.post('/all', function (req, res) {
    syncModel(req.dbConnection, function (err) {
        if (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err, err));
        } else {
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Done all ", "Done all"));
        }
    }, 'all');
});

module.exports = router;