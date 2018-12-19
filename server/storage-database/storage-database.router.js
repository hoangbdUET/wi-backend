const express = require('express');
const router = express.Router();
const Model = require('./storage-database.model');

router.post('/storage-database/new', (req, res) => {
	Model.createNewStorageDatabase(req.body, req.dbConnection, (status) => {
		res.send(status);
	});
});

router.post('/storage-database/info', (req, res) => {
	Model.infoStorageDatabase(req.body, req.dbConnection, status => {
		res.send(status);
	});
});

router.post('/storage-database/delete', (req, res) => {
	Model.deleteStorageDatabase(req.body, req.dbConnection, status => {
		res.send(status);
	});
});

router.post('/storage-database/list', (req, res) => {
	Model.listStorageDatabase(req.body, req.dbConnection, status => {
		res.send(status);
	});
});

router.post('/storage-database/list-by-user-project', (req, res) => {
	Model.listStorageDatabaseByUser(req.body, req.dbConnection, status => {
		res.send(status);
	});
});

module.exports = router;