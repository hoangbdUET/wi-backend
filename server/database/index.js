"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let express = require("express");
let router = express.Router();
let Sequelize = require("sequelize");
let bodyParser = require("body-parser");
let config = require("config").Database;
let models = require("../models");
let updateFamilyModel = require('../family/global.family.models');
let updateOverlayLineModel = require('../overlay-line/overlay-line.model');
let workflowSpecModel = require('../workflow-spec/workflow-spec.model');
let taskSpecModel = require('../task/task-spec');
let zoneTemplateModel = require('../zone-template/zone-template.model');
let jwt = require('jsonwebtoken');

router.use(bodyParser.json());

router.post('/database/update', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    if (token) {
        jwt.verify(token, 'secretKey', function (err, decoded) {
            if (err) {
                return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Authentication failed", "Authentication failed"));
            } else {
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
                let dbName = 'wi_' + decoded.username.toLowerCase();
                sequelize.query("CREATE DATABASE IF NOT EXISTS " + dbName).then(rs => {
                    if (rs[0].warningStatus === 0) {
                        models(dbName).sequelize.sync().then(() => {
                            updateFamilyModel.syncFamilyData({username: dbName.substring(3).toLowerCase()}, function (result) {
                                console.log("Successfull update family for user : ", dbName);
                                updateOverlayLineModel.syncOverlayLine(dbName.substring(3).toLowerCase(), function (err, success) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("Overlay line sync : ", success);
                                        workflowSpecModel.syncWorkflowSpec(dbName.substring(3).toLowerCase(), function (error, successfull) {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log("Workflow spec sync: DONE");
                                                taskSpecModel.syncTaskSpec(dbName.substring(3).toLowerCase(), function (err, successfull) {
                                                    console.log("Task spec sync: DONE");
                                                    console.log("SUCCESSFULL CREATED NEW DATABASE ", dbName);
                                                });
                                                zoneTemplateModel.synZoneTemplate(dbName.substring(3).toLowerCase(), function () {
                                                    console.log("Zone template sync: DONE");
                                                });
                                            }
                                        });
                                    }
                                });
                                res.send(ResponseJSON(ErrorCodes.SUCCESS, "Create database successful", {database: dbName}));
                            });
                        }).catch(function (err) {
                            console.log(err);
                            res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error while sync database", err.message));
                        });
                    } else {
                        console.log("DATABASE EXISTS ", dbName);
                        res.send(ResponseJSON(ErrorCodes.SUCCESS, "Database existed", dbName));
                    }
                    sequelize.close();
                }).catch(err => {
                    console.log(err.message);
                    res.send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some error", err.message));
                });
            }
        });
    } else {
        return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No token provided"));
    }
});

router.delete('/database/update', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    if (token) {
        jwt.verify(token, 'secretKey', function (err, decoded) {
            if (err) {
                return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Authentication failed", "Authentication failed"));
            } else {
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
                let dbName = 'wi_' + decoded.username;
                sequelize.query("DROP DATABASE IF EXISTS " + dbName).then(rs => {
                    if (rs[0].warningStatus === 0) {
                        console.log("DROP DATABASE ", dbName);
                        models(dbName, function () {

                        }, true);
                        res.status(200).send(ResponseJSON(ErrorCodes.SUCCESS, "Drop database successful", {database: dbName}));
                    } else {
                        console.log("NO DATABASE EXISTS ", dbName);
                        res.status(200).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No database"));
                    }
                    sequelize.close();
                }).catch(err => {
                    console.log(err.message);
                    res.status(200).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Some error", err.message));
                });
            }
        });
    } else {
        return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No token provided"));
    }

});

module.exports = router;