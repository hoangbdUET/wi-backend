const express = require('express');
const router = express.Router();
var models = require('../models-master');
var bodyParser = require('body-parser');
var User = models.User;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var jwt = require('jsonwebtoken');
var models = require('../models');
var updateFamilyModel = require('../family/global.family.models');
var md5 = require('md5');
let captchaList = require('../captcha/captcha').captchaList;
router.use(bodyParser.json());

// router.post('/login', function (req, res) {
//     req.body.password = md5(req.body.password);
//     User.findOne({where: {username: req.body.username}})
//         .then(function (user) {
//             if (!user) {
//                 res.status(401).send(ResponseJSON(ErrorCodes.ERROR_USER_NOT_EXISTS, "User not exist"))
//             } else {
//                 if (user.password != req.body.password) {
//                     res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Wrong password. Authenticate fail"))
//                 } else {
//                     var token = jwt.sign(req.body, 'secretKey', {expiresIn: '24h'});
//                     res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
//                 }
//             }
//         });
// });

router.post('/login', function (req, res) {
    req.body.password = md5(req.body.password);
    User.findOne({where: {username: req.body.username}})
        .then(function (user) {
            if (!user) {
                res.status(401).send(ResponseJSON(ErrorCodes.ERROR_USER_NOT_EXISTS, "User not exist"));
            } else {
                if (user.password != req.body.password) {
                    res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Wrong password. Authenticate fail"));
                } else {
                    if (user.status == "Inactive") {
                        res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Hi, " + user.username + "! Yor are not actived!"));
                    } else if (user.status == "Actived") {
                        var sequelize = user.sequelize;
                        var dbName = 'wi_' + user.username.toLowerCase();
                        sequelize.query('CREATE DATABASE IF NOT EXISTS ' + dbName).then(rs => {
                            // console.log(rs[0].warningStatus);
                            if (rs[0].warningStatus != 1) {
                                var dbConnection = models(dbName);
                                dbConnection.sequelize.sync()
                                    .then(function () {
                                        updateFamilyModel.syncFamilyData({username: user.username.toLowerCase()}, function (result) {
                                            var token = jwt.sign(req.body, 'secretKey', {expiresIn: '24h'});
                                            res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
                                            console.log("Successfull update family for user : ", dbName);
                                        });
                                    })
                                    .catch(function (err) {
                                        console.log(dbName + err);
                                    });
                            } else {
                                var token = jwt.sign(req.body, 'secretKey', {expiresIn: '24h'});
                                res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
                            }
                        });

                    } else {
                        res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Hi, " + user.username + "! Yor are not actived!"));
                    }
                }
            }
        });
});


// router.post('/register', function (req, res) {
//     req.body.password = md5(req.body.password);
//     User.create({username: req.body.username, password: req.body.password})
//         .then(function (result) {
//             //Create user's database;
//             var sequelize = result.sequelize;
//             var dbName = 'wi_' + result.username.toLowerCase();
//             sequelize.query('CREATE DATABASE ' + dbName);
//             //Create all tables then update family, family-condition
//             var dbConnection = models(dbName);
//             dbConnection.sequelize.sync()
//                 .then(function () {
//                     updateFamilyModel.syncFamilyData({username: result.username.toLowerCase()}, function (result) {
//                         console.log("Successfull update family for user : ", dbName);
//                     });
//                 })
//                 .catch(function (err) {
//                     console.log(dbName + err);
//                 });
//             //Create token then send
//             var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
//             res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
//         })
//         .catch(function (err) {
//             res.status(401).send(ResponseJSON(ErrorCodes.ERROR_USER_EXISTED, "User existed!"));
//         })
// });
router.post('/register', function (req, res) {
    req.body.password = md5(req.body.password);
    User.create({
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
        email: req.body.email
    }).then(function (result) {
        //Create token then send
        var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
        res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
    }).catch(function (err) {
        res.status(401).send(ResponseJSON(ErrorCodes.ERROR_USER_EXISTED, "User existed!"));
    })
    // if (captchaList.get(req.body.captcha)) {
    //     captchaList.delete(req.body.captcha);
    // } else {
    //     // captchaList.delete(req.body.captcha);
    //     // res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Captcha is not correct!", "CAPTCHA"));
    // }
});
module.exports = router;
