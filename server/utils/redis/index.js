let redis = require('redis');
const config = require('config');
let redisClient = redis.createClient(process.env.BACKEND_REDIS_PORT || config.redis.port, process.env.BACKEND_REDIS_HOST || config.redis.host);
redisClient.on("error", function (err) {
    console.log("Connecting redis-server err : ", err);
});
redisClient.on("connect", function () {
    console.log("Connected to redis server!");
});
module.exports = {
    redisClient: redisClient,
};