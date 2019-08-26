let jwt = require('jsonwebtoken');
let config = require('config');
let models = require('../models');
let ErrorCodes = require('../../error-codes').CODES;
let ResponseJSON = require('../response');
let openingProject = require('./opening-project');
let validateRequest = require("../utils/validate-request");
let skipList = [
	'^/pattern.*\.png$',
	'/csv/.*',
	// '/thumbnail'
];
module.exports = function () {
	return function (req, res, next) {
		let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization') || req.query.token;
		if ((process.env.VALIDATION_REQUEST_STATUS = (process.env.VALIDATION_REQUEST_STATUS === "true") || config.validationRequestStatus) && validateRequest(req, token) === false) {
			return res.status(200).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Request validation failed", "Request validation failed"));
		}
		if (new RegExp(skipList.join('|')).test(req.originalUrl)) {
			req.decoded = {username: "unauthorized"};
			next();
		} else {
			openingProject.sync().then(function (opening) {
				if (token) {
					jwt.verify(token, process.env.BACKEND_JWTKEY || 'secretKey', function (err, decoded) {
						if (err) {
							return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Authentication failed", "Authentication failed"));
						} else {
							decoded.realUser = decoded.username;
							if (opening[decoded.username]) {
								console.log(decoded.realUser + " --- Working with shared session from : ", opening[decoded.username].owner);
								decoded.username = opening[decoded.username].owner;
								req.dbConnection = models((process.env.BACKEND_DBPREFIX || config.Database.prefix) + decoded.username.toLowerCase());
								req.logger = require('../utils/user-logger')(decoded.username.toLowerCase(), req.get('CurrentProject'));
								// noinspection DuplicatedCode
								req.dbConnection.sequelize.authenticate().then(() => {
									req.decoded = decoded;
									req.token = token;
									req.createdBy = decoded.realUser;
									req.updatedBy = decoded.realUser;
									req.body.createdBy = decoded.realUser;
									req.body.updatedBy = decoded.realUser;
									// console.log("=============", decoded.realUser);
									next();
								}).catch(err => {
									console.log(err);
									return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Error connecting to database", "Error connecting to database"));
								});
							} else {
								console.log(decoded.username + " --- Working with master session");
								req.logger = require('../utils/user-logger')(decoded.username.toLowerCase(), req.get('CurrentProject'));
								req.dbConnection = models((process.env.BACKEND_DBPREFIX || config.Database.prefix) + decoded.username.toLowerCase(), (err) => {
									console.log(err);
									if (err) return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Some err", "Some err"));
								});
								// noinspection DuplicatedCode
								req.dbConnection.sequelize.authenticate().then(() => {
									req.decoded = decoded;
									req.token = token;
									req.createdBy = decoded.username;
									req.updatedBy = decoded.username;
									req.body.createdBy = decoded.username;
									req.body.updatedBy = decoded.username;
									next();
								}).catch(err => {
									console.log(err);
									return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Error connecting to database", "Error connecting to database"));
								});
							}
						}
					});
				} else {
					return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No token provided"));
				}
			});
		}
	}
};
