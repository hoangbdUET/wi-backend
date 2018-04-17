let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.Ternary.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'ternary.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Ternary : Do not have permission"});
                }
            });
        });

    });
    dbConnection.Ternary.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'ternary.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Ternary : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Ternary.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'ternary.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Ternary : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};