module.exports = function (dbConnection) {
    dbConnection.PointSet.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            if (object.createdBy !== object.updatedBy) {
                reject({message: "Do not have permission"});
            } else {
                resolve(object, options);
            }
        });
    });
    dbConnection.PointSet.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            if (object.createdBy !== object.updatedBy) {
                reject({message: "Do not have permission"});
            } else {
                resolve(object, options);
            }
        });
    });
};