let checkPerm = require('../utils/permission/check-permisison');
let config = require('config');
let USER_MAX_CURVE = process.env.USER_MAX_CURVE || config.Application.USER_MAX_CURVE|| 999999;
module.exports = function (dbConnection) {
    dbConnection.Curve.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'curve.create', function (result) {
                if (result) {
                    dbConnection.Curve.findAndCountAll().then(curves => {
                        if (curves.count >= USER_MAX_CURVE) {
                            reject({ message: "Curve - Out of quota: " + USER_MAX_CURVE })
                        } else {
                            resolve(object, options);
                        }
                    });
                } else {
                    reject({message: "Curve : Do not have permission"});
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
                        reject({message: "Curve : Do not have permission"});
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
                        reject({message: "Curve : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};