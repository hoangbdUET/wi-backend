module.exports = function (dbConnection) {
    dbConnection.Plot.hook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            console.log("Hooks check perm ", options);
            if (object.createdBy !== object.updatedBy) {
                reject({message: "Do not have permission"});
            } else {
                resolve(object, options);
            }
        });
    });
    dbConnection.Plot.hook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            if (object.createdBy !== object.updatedBy) {
                reject({message: "Do not have permission"});
            } else {
                resolve(object, options);
            }
        });
    });
};