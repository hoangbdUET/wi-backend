let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.MarkerSet.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'marker-set.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: "Marker Set : Do not have permission" });
                }
            });
        });

    });
    dbConnection.MarkerSet.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'marker-set.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Marker Set : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.MarkerSetTemplate.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'marker-set.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Marker Set : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};