let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.ObjectOfTrack.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'object-of-track.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Object Of Object Track : Do not have permission"});
                }
            });
        });

    });
    dbConnection.ObjectOfTrack.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'object-of-track.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Object Of Object Track : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.ObjectOfTrack.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'object-of-track.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Object Of Object Track : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};