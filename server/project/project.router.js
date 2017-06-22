
var express = require('express');
var projectModel = require('../models/project.model');
var router = express.Router();
var wellRouter = require('../well/well.router');
var bodyParser = require('body-parser');

router.use('/project',wellRouter);
router.use(bodyParser.json());
router.get('/project', function (req, res) {
    res.send('Welcome Screen');
});
router.post('/project/new', function (req, res) {
    // res.send("Show Create New Project Form");
    const result=projectModel.createNewProject(req.body);
    res.send(result);
});
router.post('/project/edit', function (req, res) {

    const result=projectModel.editProject(req.body);
    res.send(result);
});
router.delete('/project/delete', function (req, res) {
    res.send("Delete Project .....");
    projectModel.deleteProject();
});



module.exports = router;