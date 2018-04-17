let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.Marker.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'marker.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Marker : Do not have permission"});
                }
            });
        });

    });
    dbConnection.Marker.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'marker.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Marker : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Marker.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'marker.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Marker : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};