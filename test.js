let redisClient = require('./server/utils/redis').redisClient;
let express = require('express');
let router = express.Router();
router.get('/test', function (req, res) {
    redisClient.set('url', req.originalUrl, function (err, success) {
        console.log(err, success);
    });
    redisClient.get('url', function (err, reply) {
        res.send(reply);
    });
});
module.exports = router;