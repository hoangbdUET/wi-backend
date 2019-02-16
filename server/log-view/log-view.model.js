"use strict";
let ResponseJSON = require('../response');
let request = require('request');
let config = require('config');
let ES_HOST = config.get('elasticsearch.host');

function viewByUserName(userName, cb) {
  let uri = `${ES_HOST}/wi-backend-${userName}-*/_search`

  request.get(uri, (err, resp) => {
    if (err) {
      cb(ResponseJSON(400, err.message, err.message))
    } else {
      let data = JSON.parse(resp.body).hits.hits
      
      if (!data.length) {
        cb(ResponseJSON(404,
          'User is not found or there is no logs for this user',
          'User is not found or there is no logs for this user')
        )
      } else {
        let respData = data.map(d => d._source)
        cb(ResponseJSON(200, 'done', respData))
      }
    }
  })
}

function viewByTaskname(tasknName, cb) {
  let query = `data.message:${tasknName}`
  let uri = `${ES_HOST}/wi-backend-*-*/_search?q=${query}`

  request.get(uri, (err, resp) => {
    if (err) {
      cb(ResponseJSON(400, err.message, err.message))
    } else {
      let data = JSON.parse(resp.body).hits.hits
      
      if (!data.length) {
        cb(ResponseJSON(404,
          'taskName is not found or there is no logs for this task',
          'taskName is not found or there is no logs for this task')
        )
      } else {
        cb(ResponseJSON(200, 'done', data))
      }
    }
  })
}


module.exports = {
  viewByUserName: viewByUserName,
  viewByTaskname: viewByTaskname
}