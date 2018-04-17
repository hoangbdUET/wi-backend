let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.ImageOfTrack.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'image-of-track.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Image Of Image TracK : Do not have permission"});
                }
            });
        });

    });
    dbConnection.ImageOfTrack.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'image-of-track.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Image Of Image TracK : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.ImageOfTrack.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'image-of-track.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Image Of Image TracK : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};