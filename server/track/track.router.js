var express = require('express');
var router = express.Router();
var trackModel = require('./track.model');
var bodyParser = require('body-parser');
var fs = require('fs');
const multer = require('multer');


router.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({storage: storage});

router.post('/track/info', function (req, res) {
    trackModel.getTrackInfo(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/track/new', function (req, res) {
    trackModel.createNewTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.post('/track/edit', function (req, res) {
    trackModel.editTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});
router.delete('/track/delete', function (req, res) {
    trackModel.deleteTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/track/export', function (req, res) {
    trackModel.exportData(req.body, function (code, fileResult) {
        res.status(code).sendFile(fileResult, function (err) {
            if (err) console.log('Export track: ' + err);
            fs.unlinkSync(fileResult);
        });
    }, function (code) {
        res.status(code).end();
    }, req.dbConnection, req.decoded.username)
});

router.post('/track/import', upload.single('file'), function (req, res) {
    trackModel.importTrackTemplate(req, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
