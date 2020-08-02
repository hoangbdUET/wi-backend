let checkPerm = require('../utils/permission/check-permisison');
let config = require('config');
let USER_MAX_PROJECT = process.env.USER_MAX_PROJECT || config.Application.USER_MAX_PROJECT || 999999;
module.exports = function (dbConnection) {
    dbConnection.Project.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            checkPerm(object.updatedBy, 'project.create', function (result) {
                if (result) {
                    console.log("========new project")
                    dbConnection.Well.findAndCountAll().then(projects => {
                        if (projects.count >= USER_MAX_PROJECT) {
                            reject({ message: "Project - Out of quota: " + USER_MAX_PROJECT })
                        } else {
                            resolve(object, options);
                        }
                    });
                } else {
                    reject({ message: "Project: Do not have permission" });
                }
            });
        });

    });
};