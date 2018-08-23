const express = require('express');
const router = express.Router();
let checkPermission = require('../utils/permission/check-permisison');
const ResponseJSON = require('../response');


router.post("/check", function (req, res) {
    let data = req.body;
    checkPermission(req.updatedBy, data.perm, function (status) {
        res.send(ResponseJSON(200, "Done", {
            username: req.updatedBy,
            perm: data.perm,
            value: status
        }));
    });
});

module.exports = router;