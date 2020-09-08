let express = require('express');
let router = express.Router();
let tadpoleTrackModel = require('./tadpole-track.model');





router.post('/tadpole-track/info', function (req, res) {
	tadpoleTrackModel.infoTadpoleTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.post('/tadpole-track/new', function (req, res) {
	tadpoleTrackModel.createTadpoleTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.post('/tadpole-track/edit', function (req, res) {
	tadpoleTrackModel.editTadpoleTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.delete('/tadpole-track/delete', function (req, res) {
	tadpoleTrackModel.deleteTadpoleTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});


module.exports = router;
