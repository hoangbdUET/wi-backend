"use strict";
let ResponseJSON = require('../response');
const _ = require('lodash');
const config = require('config');
const loggingServiceUrl = process.env.LOGGING_SERVICE || config.Service.logger || "http://localhost:3333";
const wiLog = require('wi-logger');
const logger = new wiLog('./logs');

let options = {
    method: 'POST',
    url: loggingServiceUrl + '/find-log',
    headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Authorization': ''
    },
    body: {},
    json: true,
    strictSSL: false
};

function viewByUserName(userName, cb, token, project) {
    options.headers.Authorization = token;
    options.body.username = userName;
    options.body.project = project;
    cb(ResponseJSON(200, "Done", []));
}

function viewByObject(data, cb, token) {
    cb(ResponseJSON(200, "Done", []))
}


function putLog(data, cb, username, owner) {
    /*
            {
	                "username": "hoangbd",
	                "level": "info",
	                "project": "1",
                	"message": "WI_PLOT myPlot has been deleted"
            }
     */
    data.username = data.username || owner || username;
    data.level = data.level || "info";
    if (data.level === "error") {
        logger.error({message: data.message, username: data.username, project: data.project, updatedBy: data.updatedBy});
        cb(ResponseJSON(200, "Done"));
    } else if (data.level === "warn") {
        logger.warn({message: data.message, username: data.username, project: data.project, updatedBy: data.updatedBy});
        cb(ResponseJSON(200, "Done"));
    } else if (data.level === "success") {
        logger.success({message: data.message, username: data.username, project: data.project, updatedBy: data.updatedBy});
        cb(ResponseJSON(200, "Done"));
    } else {
        logger.info({message: data.message, username: data.username, project: data.project, updatedBy: data.updatedBy});
        cb(ResponseJSON(200, "Done"));
    }
}

module.exports = {
    viewByUserName: viewByUserName,
    viewByObject: viewByObject,
    putLog: putLog
};