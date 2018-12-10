"use strict";

let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let express = require("express");
let router = express.Router();
let Sequelize = require("sequelize");
let bodyParser = require("body-parser");
let config = require("config").Database;
let models = require("../models");
let jwt = require('jsonwebtoken');
let syncJob = require('./sync-master-to-user');

router.use(bodyParser.json());

router.post('/database/update', function (req, res) {
	let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
	if (token) {
		jwt.verify(token, 'secretKey', function (err, decoded) {
			if (err) {
				return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Authentication failed", "Authentication failed"));
			} else {
				let sequelize = new Sequelize('wi_backend', config.user, config.password, {
					host: config.host,
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
				let dbName = config.prefix + decoded.username.toLowerCase();
				sequelize.query("CREATE DATABASE IF NOT EXISTS `" + dbName + "` CHARACTER SET utf8 COLLATE utf8_general_ci").then(rs => {
					if (rs[0].warningStatus === 0) {
						models(dbName).sequelize.sync().then(() => {
							let userDbConnection = models(dbName, function (err) {
								if (err) {
									return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
								}
							});
							syncJob({userDbConnection, username: decoded.username}, function () {
								res.send(ResponseJSON(ErrorCodes.SUCCESS, "Create database successful", {database: dbName}));
							});
						});
					} else {
						console.log("DATABASE EXISTS ", dbName);
						res.send(ResponseJSON(ErrorCodes.SUCCESS, "Database's name already exists", dbName));
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

module.exports = router;