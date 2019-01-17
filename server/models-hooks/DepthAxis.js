let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.DepthAxis.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'depth-axis.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({message: "Depth Axis : Do not have permission"});
                }
            });
        });

    });
    dbConnection.DepthAxis.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'depth-axis.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Depth Axis : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.DepthAxis.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'depth-axis.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({message: "Depth Axis : Do not have permission"});
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};