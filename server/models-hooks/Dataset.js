let checkPerm = require('../utils/permission/check-permisison');
let redisClient = require('../utils/redis').redisClient;

module.exports = function (dbConnection) {
    dbConnection.Dataset.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'dataset.create', function (result) {
                if (result) {
                    dbConnection.Dataset.findAndCountAll().then(datasets => {
                        redisClient.hget(object.updatedBy + ":quota", 'dataset', (err, result) => {
                            if (datasets.count + 1 > parseInt(result) || err) {
                                reject({ message: "Dataset - Out of quota: " + result })
                            } else {
                                resolve(object, options);
                            }
                        })
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