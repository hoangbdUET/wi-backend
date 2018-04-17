let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.ZoneSet.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'zone-set.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Zone Set : Do not have permission"});
                }
            });
        });

    });
    dbConnection.ZoneSet.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'zone-set.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Zone Set : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.ZoneSet.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'zone-set.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Zone Set : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};