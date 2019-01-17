let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.PointSet.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'point-set.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Cross Plot / Point Set : Do not have permission"});
                }
            });
        });

    });
    dbConnection.PointSet.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'point-set.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Cross Plot / Point Set : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.PointSet.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'point-set.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Cross Plot / Point Set : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};