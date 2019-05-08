"use strict";
let ResponseJSON = require('../response');
// let config = require('config');
// let ES_HOST = process.env.BACKEND_ELASTICSEARCH || config.get('elasticsearch.host');
// const elasticsearch = require('elasticsearch');
// const client = new elasticsearch.Client({
// 	host: ES_HOST,
// });
const _ = require('lodash');
const config = require('config');
const request = require('request');
const loggingServiceUrl = process.env.LOGGING_SERVICE || config.Service.logger || "http://localhost:3333";

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
	options.project = project;
	request(options, (err, resp, body) => {
		if (err) {
			console.log("error push log ", err.message);
		} else {
			cb(ResponseJSON(body.code, body.reason, body.content));
			// console.log("Pushed ", body ? body.content._id : "null body", JSON.stringify(options.body));
		}
	});
	// client.search({
	// 	index: `wi-backend-${userName}-*`,
	// 	body: {}
	// }).then(resp => {
	// 	let data = resp.hits.hits;
	//
	// 	if (!data.length) {
	// 		cb(ResponseJSON(404,
	// 			'User is not found or there is no logs for this user',
	// 			'User is not found or there is no logs for this user')
	// 		)
	// 	} else {
	// 		let respData = data.map(d => d._source.data);
	// 		cb(ResponseJSON(200, 'done', respData));
	// 	}
	// }).catch(err => {
	// 	cb(ResponseJSON(512, err.message, err));
	// });
}

function viewByObject(data, cb, token) {
	cb(ResponseJSON(200, "Done", []))
	// console.log(data.username);
	// let query = `data.message.object:${data.object} AND 1=1 `;
	// if (_.isFinite(data.idObject)) query += `AND data.message.idObject:${data.idObject} `;
	// if (data.username) query += `AND data.username:${data.username}`;
	// console.log(_.isFinite('hoang'));
	// client.search({
	// 	index: 'wi-backend-*-*',
	// 	body: {
	// 		query: {
	// 			query_string: {
	// 				query: query
	// 			}
	// 		}
	// 	}
	// }).then(resp => {
	// 	let data = resp.hits.hits;
	//
	// 	if (!data.length) {
	// 		cb(ResponseJSON(404,
	// 			'Object is not found or there is no logs for this object',
	// 			'Object is not found or there is no logs for this object')
	// 		)
	// 	} else {
	// 		let respData = data.map(d => d._source.data);
	// 		cb(ResponseJSON(200, 'done', respData));
	// 	}
	// }).catch(err => {
	// 	cb(ResponseJSON(512, err.message, err));
	// });
}

module.exports = {
	viewByUserName: viewByUserName,
	viewByObject: viewByObject
};