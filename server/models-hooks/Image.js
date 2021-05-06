let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.Image.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'image.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: "Image : Do not have permission" });
                }
            });
        });

    });
    dbConnection.Image.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'image.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Image : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Image.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'image.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Image : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};