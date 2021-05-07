const checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.Task.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'workflow.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: "Flow : Do not have permission" });
                }
            });
        });

    });
    dbConnection.Task.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'workflow.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Flow : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.Task.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'workflow.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    console.log(object.createdBy, object.updatedBy)
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Flow : Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};