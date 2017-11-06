var jwt = require('jsonwebtoken');
var models = require('../models');
var ErrorCodes = require('../../error-codes').CODES;
var ResponseJSON = require('../response');

module.exports = function () {
    return function (req, res, next) {
        var token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
        if (token) {
            jwt.verify(token, 'secretKey', function (err, decoded) {
                if (err) {
                    return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Authentication failed", "Authentication failed"));
                } else {
                    req.dbConnection = models('wi_' + decoded.username.toLowerCase(), (err) => {
                        if (err) return res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some err", "Some err"));
                    });
                    if (req.dbConnection) {
                        req.decoded = decoded;
                        next();
                    } else {
                        return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "You are not activated", "You are not activated"));
                    }
                }
            });

            /*req.dbConnection = models('wi_hoangbd');
            // req.decoded = decoded;
            next();//TODO*/
        } else {
            return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No token provided"));
        }
    }
};
