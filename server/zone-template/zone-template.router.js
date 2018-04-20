let express = require('express');
let router = express.Router();
let zoneTempModel = require('./zone-template.model');
router.post('/zone-template/list', function (req, res) {
    zoneTempModel.listZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-template/new', function (req, res) {
    zoneTempModel.newZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-template/import', function (req, res) {
    zoneTempModel.importZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-template/export', function (req, res) {
    zoneTempModel.exportZoneTemplate(req.body, function (err, file) {
        if (!err) {
            res.sendFile(file, function (err) {
                if (err) console.log(err);
                let fs = require('fs');
                fs.unlinkSync(file);
            });
        } else {
            res.send({
                code: 512,
                reason: err,
                content: err
            });
        }
    }, req.dbConnection);
});

router.post('/zone-template/all', function (req, res) {
    zoneTempModel.allZone(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/zone-template/edit', function (req, res) {
    zoneTempModel.editZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/zone-template/delete', function (req, res) {
    zoneTempModel.deleteZoneTemplate(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
module.exports = router;