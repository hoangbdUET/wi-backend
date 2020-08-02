let checkPerm = require('../utils/permission/check-permisison');
let config = require('config');
let USER_MAX_DATASET = process.env.USER_MAX_DATASET || config.Application.USER_MAX_DATASET || 999999;
module.exports = function (dbConnection) {
    dbConnection.Dataset.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'dataset.create', function (result) {
                if (result) {
                    dbConnection.Dataset.findAndCountAll().then(datasets => {
                        if (datasets.count >= USER_MAX_DATASET) {
                            reject({ message: "Dataset - Out of quota: " + USER_MAX_DATASET })
                        } else {
                            resolve(object, options);
                        }
                    });
                } else {
                    reject({ message: "Dataset : Do not have permission" });
                }
            });
        });

    });
    dbConnection.Dataset.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'dataset.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Dataset : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Dataset.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'dataset.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Dataset : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};