var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var asyncEach = require('async/each');

router.use(bodyParser.json());

router.post('/test', function (req, res) {
    let Curve = req.dbConnection.Curve;
    Curve.destroy({
        where: {
            idCurve: 2
        },
        force: true
    }).then(rs => {
        console.log(rs);
    }).catch(err => {
        console.log(err);
    });
    res.send('OK');
});

router.post('/test/select', function (req, res) {
    let Curve = req.dbConnection.Curve;
    Curve.findAll({
        where: {
            deletedAt: {ne: null}
        },
        paranoid: false
    }).then(rs => {
        asyncEach(rs, function (t) {
            t.restore();
        })
        res.send(rs);
    }).catch(err => {
        console.log(err);
    })

});

router.post('/test/delete', function (req, res) {
    let Curve = req.dbConnection.Curve;
    Curve.findOne({
        where: {
            idCurve: req.body.idCurve
        },
        paranoid: false
    }).then(curve => {
        if (curve) {
            curve.destroy().then(rs => {
                res.send(rs);
            })
        }
    });
})
//cach 2 destroy force neu ko can hooks
module.exports = router;