let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.ObjectTrack.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'object-track.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Object Track : Do not have permission"});
                }
            });
        });

    });
    dbConnection.ObjectTrack.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'object-track.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Object Track : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.ObjectTrack.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'object-track.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Object Track : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};