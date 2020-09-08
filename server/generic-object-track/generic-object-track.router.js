let express = require('express');
let router = express.Router();
let tadpoleTrackModel = require('./generic-object-track.model');





router.post('/generic-object-track/info', function (req, res) {
	tadpoleTrackModel.infoTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.post('/generic-object-track/new', function (req, res) {
	tadpoleTrackModel.createTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.post('/generic-object-track/edit', function (req, res) {
	tadpoleTrackModel.editTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.delete('/generic-object-track/delete', function (req, res) {
	tadpoleTrackModel.deleteTrack(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});


module.exports = router;
