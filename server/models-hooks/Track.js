let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.Track.addHook('beforeCreate', function (track, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(track.updatedBy, 'track.create', function (result) {
                if (result) {
                    resolve(track, options);
                } else {
                    reject({message: "Track: (Create) Do not have permission"});
                }
            });
        });
    });
    dbConnection.Track.addHook('beforeDestroy', function (track, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(track.updatedBy, 'track.delete', function (result) {
                if (result) {
                    resolve(track, options);
                } else {
                    if (track.createdBy !== track.updatedBy) {
                        reject({message: "Track: (Delete) Do not have permission"});
                    } else {
                        resolve(track, options);
                    }
                }
            })
        });
    });
    dbConnection.Track.addHook('beforeUpdate', function (track, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(track.updatedBy, 'track.update', function (result) {
                if (result) {
                    resolve(track, options);
                } else {
                    if (track.createdBy !== track.updatedBy) {
                        reject({message: "Track: (Update) Do not have permission"});
                    } else {
                        resolve(track, options);
                    }
                }
            });
        });
    });
};