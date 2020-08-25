const express = require('express');
const router = express.Router();
const ResponseJSON = require('../response');

router.post('/current-resource', async (req, res) => {
    let response = {};
    let quotaString = req.decoded.q || null;
    if (!quotaString) return res.send(ResponseJSON(512, "No quota found in your authorization info", "No quota found in your authorization info"));
    let quota = JSON.parse(Buffer.from(quotaString, 'base64').toString());
    response.q = quota;
    let projects = (await req.dbConnection.Project.findAndCountAll()).count;
    let wells = (await req.dbConnection.Well.findAndCountAll()).count;
    let datasets = (await req.dbConnection.Dataset.findAndCountAll()).count;
    let curves = (await req.dbConnection.Curve.findAndCountAll()).count;
    response.p = {
        projects, wells, datasets, curves
    }
    res.json(response);
})

module.exports = router;