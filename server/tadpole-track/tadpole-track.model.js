let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewTrack(trackInfo, done, dbConnection) {
	dbConnection.TadpoleTrack.create(trackInfo).then(track => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Create new TadpoleTrack success", track));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, err.message, err.message));
	});
}

function editTrack(trackInfo, done, dbConnection) {
	delete trackInfo.createdBy;
	let Track = dbConnection.TadpoleTrack;
	Track.findByPk(trackInfo.idTadpoleTrack)
		.then(function (track) {
			Object.assign(track, trackInfo).save()
				.then(function () {
					done(ResponseJSON(ErrorCodes.SUCCESS, "Edit tadpole track success", trackInfo));
				})
				.catch(function (err) {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Tadpole Track not found for edit"))
		});
}

function deleteTrack(trackInfo, done, dbConnection) {
	let Track = dbConnection.TadpoleTrack;
	Track.findByPk(trackInfo.idTadpoleTrack)
		.then(function (track) {
			track.setDataValue('updatedBy', trackInfo.updatedBy);
			track.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", track));
            });
		})
		.catch(function (err) {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Tadpole Track not found for delete"));
		})
}

function getTrackInfo(track, done, dbConnection) {
	let Track = dbConnection.TadpoleTrack;
    Track.findByPk(track.idTadpoleTrack, {include: {all: true}}).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Tadpole Track Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

module.exports = {
    createTadpoleTrack: createNewTrack,
    infoTadpoleTrack: getTrackInfo,
    editTadpoleTrack: editTrack,
    deleteTadpoleTrack: deleteTrack
}