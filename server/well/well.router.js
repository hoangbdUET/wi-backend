/**
 *
 * Created by minhtan on 20/06/2017.
 */
var express = require('express');
var router = express.Router();



router.get('/well', function (req, res) {
    res.send("Show wells");
});
router.post('/well/new', function (req, res) {
    res.send("Add new well");

});
router.post('/well/edit', function (req, res) {

});
router.delete('/well/delete', function (req, res) {

});

module.exports = router;
