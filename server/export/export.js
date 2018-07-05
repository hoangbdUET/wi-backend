let express = require('express');
let router = express.Router();
let async = require('async');
let path = require('path');
let config = require('config');
let ResponseJSON = require('../response');
// let exporter = require('./wi-export-test');
let exporter = require('wi-export-test');

router.post('/las2', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    async.map(req.body.idObjs, function (idObj, callback) {
        req.dbConnection.Project.findById(idObj.idProject, {
            include: [{
                model: req.dbConnection.Well,
                include: [{
                    model: req.dbConnection.WellHeader
                }, {
                    model: req.dbConnection.Dataset,
                    include: {
                        model: req.dbConnection.Curve
                    }
                }],
                where: {
                    idWell: idObj.idWell
                }
            }],
        }).then(project => {
            if (project && project.createdBy === req.decoded.username) {
                exporter.exportLas2FromProject(project, idObj.datasets, config.exportPath, config.curveBasePath, req.decoded.username, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        async.each(result, function(rs, next) {  
                            rs.path = path.join(config.exportUrl, req.decoded.username, rs.fileName);
                            next();
                        }, function(err) {
                            if(err){
                                callback(err);
                            } else {
                                callback(null, result);
                            }
                        })
                    }
                })
            } else {
                callback(null, null);
            }
        })
    }, function (err, results) {
        console.log('callback called');
        if (err) {
            res.send(ResponseJSON(512, err));
        } else {
            let responseArr = [];
            async.each(results, function(rs, next) {
                async.each(rs, function(r, _next) {
                    responseArr.push(r);
                    _next();
                }, function(err){
                    next();
                })
            }, function(err){
                if(err) {
                    res.send(ResponseJSON(512, err));                    
                } else {
                    res.send(ResponseJSON(200, 'SUCCESSFULLY', responseArr));
                }
            })
        }
    });

})
router.post('/las3', function (req, res) {
    let token = req.body.token || req.query.token || req.header['x-access-token'] || req.get('Authorization');
    async.map(req.body.idObjs, function (idObj, callback) {
        req.dbConnection.Project.findById(idObj.idProject, {
            include: [{
                model: req.dbConnection.Well,
                include: [{
                    model: req.dbConnection.WellHeader
                }, {
                    model: req.dbConnection.Dataset,
                    include: {
                        model: req.dbConnection.Curve
                    }
                }],
                where: {
                    idWell: idObj.idWell
                }
            }],
        }).then(project => {
            if (project && project.createdBy === req.decoded.username) {
                exporter.exportLas3FromProject(project, idObj.datasets, config.exportPath, config.curveBasePath, req.decoded.username, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else if(result) {
                        result.path = path.join(config.exportUrl, req.decoded.username, result.fileName);
                        callback(null, result);
                    } else {
                        callback(null, null)
                    }
                })
            } else {
                callback(null, null);
            }
        })
    }, function (err, result) {
        if (err) {
            res.send(ResponseJSON(404, err));
        } else {
            res.send(ResponseJSON(200, 'SUCCESSFULLY', result));
        }
    });

})

module.exports = router;