let express = require('express');
let projectModel = require('./project.model');
let router = express.Router();
let bodyParser = require('body-parser');
let Project = require('../models').Project;

router.use(bodyParser.json());
router.registerHooks = function (io) {
	Project.addHook('afterUpdate', 'afterProjectUpdate', function (project) {
		io.emit('project-change', project.toJSON());
	});
};

router.post('/project/list', function (req, res) {
	projectModel.getProjectList(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username, req.decoded.realUser, req.token, req.decoded.company, parseInt(req.decoded.role));
});

router.post('/project/list-of-all-user', function (req, res) {
	projectModel.listProjectOffAllUser(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.token)
});

router.post('/project/list-by-user', (req, res) => {
	projectModel.listProjectByUser(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.token)
});

router.post('/project/info', function (req, res) {
	projectModel.getProjectInfo(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.post('/project/fullinfo', function (req, res) {
	projectModel.getProjectFullInfo(req.body, function (status) {
		res.send(status);
	}, req)
});
router.post('/project/new', function (req, res) {
	// res.send("Show Create New Project Form");
	projectModel.createNewProject(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username, req.decoded.company);
});
router.post('/project/edit', function (req, res) {

	projectModel.editProject(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.post('/project/delete', function (req, res) {
	projectModel.deleteProject(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});

router.delete('/project/delete', function (req, res) {
	projectModel.deleteProjectOwner(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});

router.post('/project/close', function (req, res) {
	projectModel.closeProject(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.realUser);
});

router.post('/project/share/update-permission', function (req, res) {
	projectModel.updatePermission(req, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.realUser);
});

router.post('/project/export', function (req, res) {
	projectModel.exportProject(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username)
});


router.post('/project/add-share-session', function (req, res) {
	projectModel.addShareSession(req, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/project/add-share-session', function (req, res) {
	projectModel.removeShareSession(req, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

module.exports = router;
