let express = require('express');
let router = express.Router();
let markerSetTemplateModel = require('./marker-set-template.model');



router.post('/marker-set-template/new', function (req, res) {
    markerSetTemplateModel.createNewMarkerSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.post('/marker-set-template/info', function (req, res) {
    markerSetTemplateModel.infoMarkerSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.post('/marker-set-template/list', function (req, res) {
    markerSetTemplateModel.listMarkerSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.post('/marker-set-template/edit', function (req, res) {
    markerSetTemplateModel.editMarkerSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});
router.delete('/marker-set-template/delete', function (req, res) {
    markerSetTemplateModel.deleteMarkerSetTemplate(req.body, status => {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
