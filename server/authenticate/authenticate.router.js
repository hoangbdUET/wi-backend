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
router.use(bodyParser.json());
router.post('/login', function (req, res) {
    User.findOne({where: {username: req.body.username}})
        .then(function (user) {
            if (!user) {
                res.status(401).send(ResponseJSON(ErrorCodes.ERROR_USER_NOT_EXISTS, "User not exist"))
            } else {
                if (user.password != req.body.password) {
                    res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Wrong password. Authenticate fail"))
                } else {
                    var token = jwt.sign(req.body, 'secretKey', {expiresIn: '24h'});
                    res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
                }
            }
        });
});
router.post('/register', function (req, res) {
    User.create({username: req.body.username, password: req.body.password})
        .then(function (result) {
            //Create user's database;
            var sequelize = result.sequelize;
            var dbName = 'wi_' + result.username.toLowerCase();
            sequelize.query('CREATE DATABASE ' + dbName);
            //Create all tables then update family, family-condition
            var dbConnection = models(dbName);
            dbConnection.sequelize.sync()
                .then(function () {
                    updateFamilyModel.syncFamilyData({username: result.username.toLowerCase()}, function (result) {
                        console.log("Successfull update family for user : ", dbName);
                    });
                    // var familyUpdate = require('../family/FamilyUpdater');
                    // var familyConditionUpdate = require('../family/FamilyConditionUpdater');
                    // familyUpdate(dbConnection,function() {
                    //     familyConditionUpdate(dbConnection,function(){
                    //         // main();
                    //     });
                    // });

                })
                .catch(function (err) {
                    console.log(dbName + err);
                });
            //Create token then send
            var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
        })
        .catch(function (err) {
            res.status(401).send(ResponseJSON(ErrorCodes.ERROR_USER_EXISTED, "User existed!"));
        })
});
module.exports = router;
