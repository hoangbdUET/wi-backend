let checkPerm = require('../utils/permission/check-permisison');
let redisClient = require('../utils/redis').redisClient;

module.exports = function (dbConnection) {
    dbConnection.Well.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'well.create', function (result) {
                if (result) {
                    dbConnection.Well.findAndCountAll().then(wells => {
                        redisClient.hget(object.updatedBy + ":quota", 'well', (err, result) => {
                            if (wells.count + 1 > parseInt(result) || err) {
                                reject({ message: "Well - Out of quota: " + result })
                            } else {
                                resolve(object, options);
                            }
                        })
                    });
                } else {
                    reject({ message: "Well: Do not have permission" });
                }
            });
        });

    });
    dbConnection.Well.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'well.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Well: Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Well.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'well.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Well: Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};