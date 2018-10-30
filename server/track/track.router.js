let express = require('express');
let router = express.Router();
let trackModel = require('./track.model');
let bodyParser = require('body-parser');
let fs = require('fs');
const multer = require('multer');


router.use(bodyParser.json());

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({storage: storage});

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

router.post('/track/duplicate', function (req, res) {
    trackModel.duplicateTrack(req.body, function (status) {
        res.send(status);
    }, req.dbConnection)
});

router.post('/track/apply-to-well', async function (req, res) {
    const status = await trackModel.applyToWell(req.body, req.dbConnection);
    return res.send(status);
});

module.exports = router;
