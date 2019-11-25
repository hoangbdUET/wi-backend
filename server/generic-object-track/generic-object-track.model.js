let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewTrack(trackInfo, done, dbConnection) {
	dbConnection.GenericObjectTrack.create(trackInfo).then(track => {
		done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Generic Object Track success", track));
	}).catch(err => {
		done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, err.message, err.message));
	});
}

function editTrack(trackInfo, done, dbConnection) {
	delete trackInfo.createdBy;
	let Track = dbConnection.GenericObjectTrack;
	Track.findByPk(trackInfo.idGenericObjectTrack)
		.then(function (track) {
			Object.assign(track, trackInfo).save()
				.then(function () {
					done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Generic Object Track success", trackInfo));
				})
				.catch(function (err) {
					done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err));
				})
		})
		.catch(function () {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Generic Object Track not found for edit"))
		});
}

function deleteTrack(trackInfo, done, dbConnection) {
	let Track = dbConnection.GenericObjectTrack;
	Track.findByPk(trackInfo.idGenericObjectTrack)
		.then(function (track) {
			track.setDataValue('updatedBy', trackInfo.updatedBy);
			track.destroy().then(() => {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Delete successful", info));
            });
		})
		.catch(function (err) {
			done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Generic Object Track not found for delete"));
		})
}

function getTrackInfo(track, done, dbConnection) {
	let Track = dbConnection.GenericObjectTrack;
    Track.findByPk(track.idGenericObjectTrack, {include: {all: true}}).then(result => {
        if (!result) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No Generic Object Track Found"));
        } else {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", result));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", err.message));
    });
}

module.exports = {
    createTrack: createNewTrack,
    infoTrack: getTrackInfo,
    editTrack: editTrack,
    deleteTrack: deleteTrack
}