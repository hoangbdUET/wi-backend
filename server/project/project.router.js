
var express = require('express');
var projectModel = require('../models/project.model');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/project', function (req, res) {
    projectModel.getProjectInfo(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    });
});
router.post('/project/new', function (req, res) {
    // res.send("Show Create New Project Form");
    projectModel.createNewProject(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});
router.post('/project/edit', function (req, res) {

    projectModel.editProject(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});
router.delete('/project/delete', function (req, res) {
    projectModel.deleteProject(req.body,function (err, status) {
        if (err) return res.send(status);
        res.send(status);
    })
});



module.exports = router;