let jwt = require('jsonwebtoken');
let models = require('../models');
let ErrorCodes = require('../../error-codes').CODES;
let ResponseJSON = require('../response');

module.exports = function () {
    return function (req, res, next) {
        let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
        if (token) {
            jwt.verify(token, 'secretKey', function (err, decoded) {
                if (err) {
                    return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Authentication failed", "Authentication failed"));
                } else {
                    req.dbConnection = models('wi_' + decoded.username.toLowerCase(), (err) => {
                        console.log(err);
                        if (err) return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Some err", "Some err"));
                    });
                    req.dbConnection.sequelize.authenticate().then(() => {
                        req.decoded = decoded;
                        next();
                    }).catch(err => {
                        return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Error connecting to database", "Error connecting to database"));
                    });
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
