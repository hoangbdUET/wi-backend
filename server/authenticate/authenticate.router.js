const express = require('express');
const router = express.Router();
var models = require('../models');
var bodyParser = require('body-parser');
var User = models.User;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var jwt = require('jsonwebtoken');

router.use(bodyParser.json());
router.post('/login', function (req, res) {
    User.findOne({where: {userName: req.body.userName}})
        .then(function (user) {
            if (!user) {
                res.send(ResponseJSON(ErrorCodes.SUCCESS,"Authentiactation success"))
            }else {
                if (user.password!=req.body.password) {
                    res.send(ResponseJSON(ErrorCodes.SUCCESS,"Wrong password. Authenticate fail"))
                }else {
                    var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
                    res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success",token));
                }
            }
        });

});
router.post('/register', function (req, res) {
    User.create({userName:req.body.userName,password:req.body.password})
        .then(function (result) {
            var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
        })
        .catch(function (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_USER_EXISTED, "Error" + err));
        })
});
module.exports = router;