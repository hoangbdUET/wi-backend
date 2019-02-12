let jwt = require('jsonwebtoken');
let config = require('config');
let models = require('../models');
let ErrorCodes = require('../../error-codes').CODES;
let ResponseJSON = require('../response');
let openingProject = require('./opening-project');
let skipList = [
	'^/pattern.*\.png$',
	'/csv/.*'
];
module.exports = function () {
	return function (req, res, next) {
		if (new RegExp(skipList.join('|')).test(req.originalUrl)) {
			next();
		} else {
			openingProject.sync().then(function (opening) {
				let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization') || req.query.token;
				if (token) {
					jwt.verify(token, 'secretKey', function (err, decoded) {
						if (err) {
							return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Authentication failed", "Authentication failed"));
						} else {
							decoded.realUser = decoded.username;
							if (opening[decoded.username]) {
								console.log(decoded.realUser + " --- Working with shared session from : ", opening[decoded.username].owner);
								decoded.username = opening[decoded.username].owner;
								req.dbConnection = models(config.Database.prefix + decoded.username.toLowerCase());
								req.logger = require('../utils/user-logger')(decoded.username.toLowerCase());
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
									return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Error connecting to database", "Error connecting to database"));
								});
							} else {
								console.log(decoded.username + " --- Working with master session");
								req.logger = require('../utils/user-logger')(decoded.username.toLowerCase());
								req.dbConnection = models(config.Database.prefix + decoded.username.toLowerCase(), (err) => {
									console.log(err);
									if (err) return res.status(401).send(ResponseJSON(ErrorCodes.ERROR_WRONG_PASSWORD, "Some err", "Some err"));
								});
								req.dbConnection.sequelize.authenticate().then(() => {
									req.decoded = decoded;
									req.token = token;
									req.createdBy = decoded.username;
									req.updatedBy = decoded.username;
									req.body.createdBy = decoded.username;
									req.body.updatedBy = decoded.username;
									next();
								}).catch(err => {
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
