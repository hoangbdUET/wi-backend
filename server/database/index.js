"use strict";

var express = require("express");
var router = express.Router();
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var config = require("config").Database;
var models = require("../models");
var updateFamilyModel = require('../family/global.family.models');
var updateOverlayLineModel = require('../overlay-line/overlay-line.model');
// console.log(config);
router.use(bodyParser.json());

router.post('/database/test.js', function (req, res) {
    // console.log(req);
    res.send("Hello Tan");
});

router.post('/database/update', function (req, res) {
    let response = {
        code: 200,
        reason: "SUCCESSFUL",
        content: null
    }
    let sequelize = new Sequelize('wi_backend', config.user, config.password, {
        define: {
            freezeTableName: true
        },
        dialect: config.dialect,
        port: config.port,
        logging: config.logging,
        dialectOptions: {
            charset: 'utf8'
        },
        pool: {
            max: 2,
            min: 0,
            idle: 200
        },
        operatorsAliases: Sequelize.Op,
        storage: config.storage
    });
    let dbName = req.body.dbName;
    let token = req.body.token;
    sequelize.query("CREATE DATABASE IF NOT EXISTS " + dbName).then(rs => {
        if (rs[0].warningStatus == 0) {
            models(dbName).sequelize.sync().then(() => {
                updateFamilyModel.syncFamilyData({username: dbName.substring(3).toLowerCase()}, function (result) {
                    console.log("CREATED NEW DATABASE ", dbName);
                    response.content = rs;
                    console.log("Successfull update family for user : ", dbName);
                    updateOverlayLineModel.syncOverlayLine(dbName.substring(3).toLowerCase(), function (err, success) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Overlay line sync : ", success);
                        }
                    });
                    res.status(200).send(response);
                });
            }).catch(function (err) {
                console.log(err);
                response.code = 500;
                response.reason = "SOME ERR";
                response.content = err;
                res.status(200).send(response);
            });
        } else {
            console.log("DATABASE EXISTS ", dbName);
            response.code = 200;
            response.reason = "SUCCESSFUL WITH DATABASE EXISTED";
            response.content = rs;
            res.status(200).send(response);
        }
        sequelize.close();
    }).catch(err => {
        console.log(err.message);
        response.code = 500;
        response.reason = "SOME ERR";
        response.content = err;
        res.status(200).send(response);
    });
});

router.delete('/database/update', function (req, res) {
    let response = {
        code: 200,
        reason: "SUCCESSFUL",
        content: null
    }
    let sequelize = new Sequelize('wi_backend', config.user, config.password, {
        define: {
            freezeTableName: true
        },
        dialect: config.dialect,
        port: config.port,
        logging: config.logging,
        dialectOptions: {
            charset: 'utf8'
        },
        pool: {
            max: 2,
            min: 0,
            idle: 200
        },
        operatorsAliases: Sequelize.Op,
        storage: config.storage
    });
    let dbName = req.body.dbName;
    let token = req.body.token;
    sequelize.query("DROP DATABASE IF EXISTS " + dbName).then(rs => {
        if (rs[0].warningStatus == 0) {
            console.log("DROP DATABASE ", dbName);
            response.content = rs;
            models(dbName, function () {

            }, true);
            res.status(200).send(response);
        } else {
            console.log("NO DATABASE EXISTS ", dbName);
            response.code = 200;
            response.reason = "NO DATABSE FOR DROP";
            response.content = rs;
            res.status(200).send(response);
        }
        sequelize.close();
    }).catch(err => {
        console.log(err.message);
        response.code = 500;
        response.reason = "SOME ERR";
        response.content = err;
        res.status(200).send(response);
    });
});

module.exports = router;