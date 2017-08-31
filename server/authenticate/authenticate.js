var jwt = require('jsonwebtoken');
module.exports = function () {
    return function (req, res, next) {
        var token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
        console.log(token);
        if (token){
            jwt.verify(token, 'secretKey', function (err, decoded) {
                if (err) {
                    return res.json({success: false, message: 'Failed to authenticate'});
                } else {
                    req.decoded = decoded;
                    next();
                }

            });
        } else {
            return res.status(403).send({
                success:false,
                message: 'No token provided.'
            })
        }
    }
};
