let checkPerm = require('../utils/permission/check-permisison');
let redisClient = require('../utils/redis').redisClient;

module.exports = function (dbConnection) {
    dbConnection.Project.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'project.create', function (result) {
                if (result) {
                    console.log("========new project")
                    dbConnection.Well.findAndCountAll().then(projects => {
                        redisClient.hget(object.updatedBy + ":quota", 'project', (err, result) => {
                            if (projects.count > parseInt(result) || err) {
                                reject({ message: "Project - Out of quota: " + result })
                            } else {
                                resolve(object, options);
                            }
                        })
                    });
                } else {
                    reject({ message: "Project: Do not have permission" });
                }
            });
        });

    });
};