var jwt = require('jsonwebtoken');
var models = require('../models');

module.exports = function () {
    return function (req, res, next) {
        var token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
        if (token) {
            jwt.verify(token, 'secretKey', function (err, decoded) {
                if (err) {
                    return res.json({code: 401, success: false, message: 'Failed to authenticate'});
                } else {
                    req.dbConnection = models('wi_' + decoded.username.toLowerCase());
                    req.decoded = decoded;
                    next();
                }

            });

            /*req.dbConnection = models('wi_hoangbd');
            // req.decoded = decoded;
            next();//TODO*/
        } else {
            return res.status(401).send({
                code: 401,
                success: false,
                message: 'No token provided.'
            })
        }
    }
};
