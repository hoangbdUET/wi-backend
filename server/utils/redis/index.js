let redis = require('redis');
let redisClient = redis.createClient(6379, '127.0.0.1');
redisClient.on("error", function (err) {
    console.log("Connecting redis-server err : ", err);
});
redisClient.on("connect", function () {
    console.log("Connected to redis server!");
});
module.exports = {
    redisClient: redisClient,
};