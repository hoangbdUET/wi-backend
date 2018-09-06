let redisClient = require('../redis/index').redisClient;
let request = require('request');
let config = require('config');

function getPermissionFromAuthenService(token, project_name) {
    return new Promise(function (resolve) {
        let options = {
            method: 'POST',
            url: config.Service.authenticate + '/user/get-permission',
            headers: {
                'Cache-Control': 'no-cache',
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: {project_name: project_name},
            json: true,
            strictSSL: false
        };
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
                resolve([]);
            } else {
                resolve(body.content);
            }
        });
    });
}

function loadUserPermission(token, project_name, username, isOwner) {
    return new Promise(async function (resolve, reject) {
        if (isOwner) {
            let ownerPerm = require('./owner-permission');
            for (let key in ownerPerm) {
                redisClient.hmset(username, key, ownerPerm[key]);
            }
            resolve();
        } else {
            getPermissionFromAuthenService(token, project_name).then(permission => {
                for (let key in permission) {
                    redisClient.hmset(username, key, permission[key]);
                }
                resolve();
            });
        }
    });
}


function getUserPermission() {

}

function clearUserPermission() {

}

module.exports = {
    loadUserPermission: loadUserPermission,
    getUserPermission: getUserPermission,
    clearUserPermission: clearUserPermission
};