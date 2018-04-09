module.exports = function (dbConnection) {
    dbConnection.Track.hook('beforeDestroy', function (track, options) {
        return new Promise(function (resolve, reject) {
            if (track.createdBy !== track.updatedBy) {
                reject({message: "Do not have permission"});
            } else {
                resolve(track, options);
            }
        });
    });
    dbConnection.Track.hook('beforeUpdate', function (track, options) {
        return new Promise(function (resolve, reject) {
            if (track.createdBy !== track.updatedBy) {
                reject({message: "Do not have permission"});
            } else {
                resolve(track, options);
            }
        });
    });
};