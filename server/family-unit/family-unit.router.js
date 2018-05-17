let express = require('express');
let router = express.Router();
let familyUnitModel = require('./family-unit.model');
router.post('/family/list-unit', function (req, res) {
    familyUnitModel.getListUnit(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
router.post('/family/all-unit', function (req, res) {
    familyUnitModel.getAllUnit(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});
module.exports = router;