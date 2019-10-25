"use strict";
const express = require('express');
const router = express.Router();
const logViewModel = require('./log-view.model');
const bodyParser = require('body-parser');
const axios = require('axios');
const getJsonResponse = require('../response');

router.use(bodyParser.json());

let elasticLink = process.env.BACKEND_ELASTICSEARCH || require('config').get("elasticsearch") || "http://localhost:9200";

router.post('/view-by-user', (req, res) => {
    let username = req.body.username;
    let projectName = req.body.projectName;
    let query = {};
    query.body = {
        match: {
            username: username,
            project: projectName
        }
    };
    if (req.body.time) {
        if (req.body.time.last) {
            query.time = {
                last: req.body.time.last
            }
        }
    }
    getFromElasticSearch(query, res);
});



router.post('/view-by-object', (req, res) => {
    logViewModel.viewByObject(req.body, respData => res.send(respData), req.token, req.get('CurrentProject'));
});

router.post('/put-log', (req, res) => {
    logViewModel.putLog(req.body, data => res.send(data), req.decoded.username);
});



function getFromElasticSearch(req, res) {
    let obj = {};
    let eLink = elasticLink;
    if (req.body.index) {
        eLink = elasticLink + '/' + req.body.index + '/_search';
    } else {
        res.status(512).json(getJsonResponse(512, 'Require index field in request', {}));
        return;
    }
    if (req.body.match) {
        obj = {
            query: {
                bool: {
                    must: [
                        {term: req.body.match}
                    ]
                }
            }
        }
        if (req.body.time) {
            let rangeQuery = {
                range: {
                    timestamp: {
                        gte: "now-" + req.body.time.last
                    }
                }
            }
            obj.query.bool.must.push(rangeQuery);
        }
        if (req.body.fulltext) {
            let match = {
                match: fulltext
            }
            obj.query.bool.must.push(match);
        }
        axios.get(eLink, obj)
            .then((rs) => {
                rs = rs.data;
                if (rs.hits) {
                    res.status(200).json(getJsonResponse(200, 'successfully', rs.hits));
                } else {
                    res.status(512).json(getJsonResponse(512, 'Require match field in request', {}));
                }
            })
    } else {
        res.status(512).json(getJsonResponse(512, 'Require match field in request', {}));
    }
}







module.exports = router;