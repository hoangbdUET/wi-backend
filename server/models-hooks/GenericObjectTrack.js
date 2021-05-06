let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.GenericObjectTrack.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'rose-diagram-track.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: "Rose Track : Do not have permission" });
                }
            });
        });

    });
    dbConnection.GenericObjectTrack.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'rose-diagram-track.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Rose Track : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.GenericObjectTrack.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'rose-diagram-track.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Rose Track : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};