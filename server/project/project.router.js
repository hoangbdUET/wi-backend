var express = require('express');
var projectModel = require('./project.model');
var router = express.Router();
var bodyParser = require('body-parser');
var Project=require('../models').Project;

router.use(bodyParser.json());
router.registerHooks=function (io) {
    Project.addHook('afterUpdate', 'afterProjectUpdate', function (project) {
        io.emit('project-change', project.toJSON());
    });
};

router.post('/project/list', function (req, res) {
    projectModel.getProjectList(req.body,function (status) {
        res.send(status);
    });
});
router.post('/project/info', function (req, res) {
    projectModel.getProjectInfo(req.body,function (status) {
        res.send(status);
    });
});
router.post('/project/fullinfo', function (req, res) {
    projectModel.getProjectFullInfo(req.body, function (status) {
        res.send(status);
    })
});
router.post('/project/new', function (req, res) {
    // res.send("Show Create New Project Form");
    projectModel.createNewProject(req.body, function (status) {
        res.send(status);
    });
});
router.post('/project/edit', function (req, res) {

    projectModel.editProject(req.body,function (status) {
        res.send(status);
    })
});
router.delete('/project/delete', function (req, res) {
    projectModel.deleteProject(req.body,function (status) {
        res.send(status);
    })
});



module.exports = router;
