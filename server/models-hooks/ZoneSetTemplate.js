let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.ZoneSetTemplate.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'zone-set-template.create', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: "Zone Set Template: Do not have permission" });
                }
            });
        });

    });
    dbConnection.ZoneSetTemplate.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'zone-set-template.delete', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Zone Set Template: Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
    dbConnection.ZoneSetTemplate.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'zone-set-template.update', function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    if (object.createdBy !== object.updatedBy) {
                        reject({ message: "Zone Set Template: Do not have permission" });
                    } else {
                        resolve(object, options);
                    }
                }
            });
        });
    });
};