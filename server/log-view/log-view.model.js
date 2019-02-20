"use strict";
let ResponseJSON = require('../response');
let config = require('config');
let ES_HOST = config.get('elasticsearch.host');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
	host: ES_HOST,
});
const _ = require('lodash');

function viewByUserName(userName, cb) {
	client.search({
		index: `wi-backend-${userName}-*`,
		body: {}
	}).then(resp => {
		let data = resp.hits.hits;

		if (!data.length) {
			cb(ResponseJSON(404,
				'User is not found or there is no logs for this user',
				'User is not found or there is no logs for this user')
			)
		} else {
			let respData = data.map(d => d._source.data);
			cb(ResponseJSON(200, 'done', respData));
		}
	}).catch(err => {
		cb(ResponseJSON(512, err.message, err));
	});
}

function viewByObject(data, cb) {
	console.log(data.username);
	let query = `data.message.object:${data.object} AND 1=1 `;
	if (_.isFinite(data.idObject)) query += `AND data.message.idObject:${data.idObject} `;
	if (data.username) query += `AND data.username:${data.username}`;
	console.log(_.isFinite('hoang'));
	client.search({
		index: 'wi-backend-*-*',
		body: {
			query: {
				query_string: {
					query: query
				}
			}
		}
	}).then(resp => {
		let data = resp.hits.hits;

		if (!data.length) {
			cb(ResponseJSON(404,
				'Object is not found or there is no logs for this object',
				'Object is not found or there is no logs for this object')
			)
		} else {
			let respData = data.map(d => d._source.data);
			cb(ResponseJSON(200, 'done', respData));
		}
	}).catch(err => {
		cb(ResponseJSON(512, err.message, err));
	});
}

module.exports = {
	viewByUserName: viewByUserName,
	viewByObject: viewByObject
};