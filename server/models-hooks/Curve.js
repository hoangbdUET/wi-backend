let checkPerm = require('../utils/permission/check-permisison');
let redisClient = require('../utils/redis').redisClient;

module.exports = function (dbConnection) {
    dbConnection.Curve.addHook('beforeCreate', function (object, options) {
        return new Promise(async function (resolve, reject) {
            checkPerm(object.updatedBy, 'curve.create', function (result) {
                if (result) {
                    dbConnection.Curve.findAndCountAll().then(curves => {
                        redisClient.hget(object.updatedBy + ":quota", 'curve', (err, result) => {
                            if (curves.count + 1 > parseInt(result) || err) {
                                reject({ message: "Curve - Out of quota: " + result })
                            } else {
                                resolve(object, options);
                            }
                        })
                    });
                } else {
                    reject({ message: "Curve : Do not have permission" });
                }
            });
        });

    });
    dbConnection.Curve.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'curve.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Curve : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Curve.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'curve.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Curve : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};