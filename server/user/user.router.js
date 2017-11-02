var express = require('express');
var router = express.Router();
var model = require('./user.model');
var bodyParser = require('body-parser');
router.use(bodyParser.json());

const myKey = "f82e62d7c3ea69cc12b5cdb8d621dab6";

let response = {
    code: 500,
    reason: "Authorization failed",
    content: "Authorization failed"
}

function checkPass(token, callback) {
    if (token == myKey) {
        callback(true);
    } else {
        callback(false);
    }
}

router.post('/user/list', function (req, res) {
    checkPass(req.body.token, function (passed) {
        if (passed) {
            model.listUser({}, function (status) {
                res.send(status);
            });
        } else {
            res.status(200).send(response);
        }
    });

});

router.post('/user/new', function (req, res) {
    checkPass(req.body.token, function (passed) {
        if (passed) {
            model.createUser(req.body, function (status) {
                res.send(status);
            });
        } else {
            res.status(200).send(response);
        }
    });

});

router.post('/user/info', function (req, res) {
    checkPass(req.body.token, function (passed) {
        if (passed) {
            model.infoUser(req.body, function (status) {
                res.send(status);
            });
        } else {
            res.status(200).send(response);
        }
    });

});

router.post('/user/edit', function (req, res) {
    checkPass(req.body.token, function (passed) {
        if (passed) {
            model.editUser(req.body, function (status) {
                res.send(status);
            });
        } else {
            res.status(200).send(response);
        }
    });

});

router.post('/user/delete', function (req, res) {
    checkPass(req.body.token, function (passed) {
        if (passed) {
            model.deleteUser(req.body, function (status) {
                res.send(status);
            });
        } else {
            res.status(200).send(response);
        }
    });

});

module.exports = router;