let redisClient = require('../redis/index').redisClient;
//perm = object.create || object.get || object.update || object.delete
module.exports = function (username, perm, callback, createdBy) {
    if (username === createdBy) {
        callback(true);
    } else {
        redisClient.hget(username, perm, function (err, result) {
            console.log("Get Perm : ", username, perm, result);
            if (err) {
                callback(true);
            } else {
                if (result === null) {
                    callback(true);
                } else if (result === 'true') {
                    callback(true);
                } else if (result === 'false') {
                    callback(false);
                } else {
                    callback(true);
                }
            }
        });
    }
};