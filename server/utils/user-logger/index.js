const winston = require('winston');
const path = require('path');
const config = require('config');
require('winston-daily-rotate-file');

module.exports = (username) => {
	const myFormat = winston.format.printf(info => {
		// console.log(JSON.stringify(info));
		return JSON.stringify({
			time: info.timestamp,
			username: info.label,
			level: info.level,
			message: info.message
		})
		// return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
	});

	const dailyRotateTransport = new (winston.transports.DailyRotateFile)({
		filename: path.join(config.userLogPath, username, '%DATE%.log'),
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		maxSize: '20m',
		maxFiles: '5d'
	});

	const logger = winston.createLogger({
		level: "info",
		format: winston.format.combine(winston.format.label({label: username}), winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), myFormat),
		transports: [
			new winston.transports.Console(),
			dailyRotateTransport
		]
	});
	return logger;
};