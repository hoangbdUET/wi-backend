let express = require('express');
let router = express.Router();
let patternModel = require('./pattern.model');

router.post('/pattern/list', function (req, res) {
    patternModel.getListPattern(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;