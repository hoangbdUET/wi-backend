// const winston = require('winston');
// const path = require('path');
// const config = require('config');
// require('winston-daily-rotate-file');
const request = require('request');
const config = require('config');
const loggingServiceUrl = process.env.LOGGING_SERVICE || config.Service.logger || "http://localhost:3333";
let options = {
	method: 'POST',
	url: loggingServiceUrl + '/add-log',
	headers: {
		'Cache-Control': 'no-cache',
		'Content-Type': 'application/json'
	},
	body: {},
	json: true,
	strictSSL: false
};
module.exports = (username, project) => {
	let logger = {
		info(object, idObject, message) {
			options.body = {
				username: username,
				project: project || "unknown",
				message: message,
				object: object,
				idObject: idObject,
				level: "info"
			};
			request(options, (err, resp, body) => {
				if (err) {
					console.log("error push log ", err.message);
				} else {
					console.log("Pushed ", body ? body.content._id : "null body", JSON.stringify(options.body));
				}
			});
		},
		error(object, idObject, message) {
			options.body = {
				username: username,
				project: project || "unknown",
				message: message,
				object: object,
				idObject: idObject,
				level: "error"
			};
			request(options, (err, resp, body) => {
				if (err) {
					console.log("error push log ", err.message);
				} else {
					console.log("Pushed ", body ? body.content._id : "null body", JSON.stringify(options.body));
				}
			});
		}
	};
	return logger;
};

// module.exports = (username) => {
// 	const myFormat = winston.format.printf(info => {
// 		// console.log(JSON.stringify(info));
// 		return JSON.stringify({
// 			time: info.timestamp,
// 			username: info.label,
// 			level: info.level,
// 			message: info.message
// 		})
// 		// return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
// 	});
//
// 	const dailyRotateTransport = new (winston.transports.DailyRotateFile)({
// 		filename: path.join(process.env.BACKEND_USER_LOG_PATH || config.userLogPath, username, '%DATE%.log'),
// 		datePattern: 'YYYY-MM-DD',
// 		zippedArchive: true,
// 		maxSize: '20m',
// 		maxFiles: '5d'
// 	});
//
// 	const logger = winston.createLogger({
// 		level: "info",
// 		format: winston.format.combine(winston.format.label({label: username}), winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), myFormat),
// 		transports: [
// 			new winston.transports.Console(),
// 			dailyRotateTransport
// 		]
// 	});
// 	return logger;
// };