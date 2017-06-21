
var express = require('express');
var projectModel = require('../models/project.model');
var router = express.Router();
var wellRouter = require('../well/well.router');
var bodyParser = require('body-parser');

router.use('/well',wellRouter);
router.use(bodyParser.json());
router.get('/project', function (req, res) {
    res.send('Welcome Screen');
});
router.post('/project/new', function (req, res) {
    // res.send("Show Create New Project Form");
    console.log(req.body);
    var jsonResponse = {};
    var jsonRequest = req.body;
    jsonResponse.result = jsonRequest.a + jsonRequest.x;
    res.send(jsonResponse);
});
router.post('/project/edit', function (req, res) {
    res.send("Receive New Project Information and processing");
    projectModel.createNewProject();
});
router.delete('/project/delete', function (req, res) {
    res.send("Delete Project .....");
    projectModel.deleteProject();
});



module.exports = router;