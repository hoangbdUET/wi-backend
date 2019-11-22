"use strict";
const express = require('express');
const router = express.Router();
const logViewModel = require('./log-view.model');
const bodyParser = require('body-parser');
const axios = require('axios');
const getJsonResponse = require('../response');

router.use(bodyParser.json());

let elasticLink = process.env.BACKEND_ELASTICSEARCH || require('config').get("elasticsearch") || "http://localhost:9200";

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: elasticLink });

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
    query.body.index  = req.body.index;
    if (req.body.fulltext)
        query.body.fulltext = req.body.fulltext;
    //console.log(query);
    getFromElasticSearch(query, res);
});


router.post('/search', async (req, res)=>{
    //if this is company admin
    if (req.decoded.role == 1) {
        //this is company admin
        //see only his company
        if (req.body.match) {
            req.body.match.company = req.decoded.company
        } else {
            req.body.match = {};
            req.body.match.company = req.decoded.company
        }
    } else if (req.decoded.role == 2) {
        //normal user, see only their log
        if (req.body.match) {
            req.body.match.username = req.decoded.username
        } else {
            req.body.match = {};
            req.body.match.username = req.decoded.username
        }
    }
    //console.log(req.body);
    await getFromElasticSearch(req, res);
});


router.post('/view-by-object', (req, res) => {
    logViewModel.viewByObject(req.body, respData => res.send(respData), req.token, req.get('CurrentProject'));
});

router.post('/put-log', (req, res) => {
    logViewModel.putLog(req.body, data => res.send(data), req.decoded.username);
});


async function getFromElasticSearch(req, res) {
    let obj = {};
    if (req.body.index) {
        //do nothing
    } else {
        res.status(512).json(getJsonResponse(512, 'Require index field in request', {}));
        return;
    }
    if (req.body.match) {
        obj = {
            sort: {
                "timestamp": "desc"
            },
            query: {
                bool: {
                    must: [
                    ]
                }
            }
        }
        let arr = Object.keys(req.body.match);
        for (let i = 0; i < arr.length; i++) {
            let aObj = {};
            aObj[arr[i]] = req.body.match[arr[i]];
            obj.query.bool.must.push({term: aObj});
        }
        if (req.body.time) {
            let rangeQuery = {
                range: {
                    timestamp: {
                        gt: req.body.time.from || "now",
                        lt: req.body.time.to || "now"
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
        let size = parseInt(req.body.limit || 50);
        obj.from = parseInt(req.body.from || 0);
        if (req.body.to) {
            obj.to = parseInt(req.body.to);
        }
        obj.size = size;
        try {
            let rs = await client.search({
                index: req.body.index,
                type: '_doc',
                body: obj
            });
            res.json(getJsonResponse(200, 'Successfully', rs.body.hits));
        } catch (e) {
            res.status(512).json(getJsonResponse(512, e.message, {}));
        }
    } else {
        res.status(512).json(getJsonResponse(512, 'Require match field in request', {}));
    }
}

module.exports = router;
