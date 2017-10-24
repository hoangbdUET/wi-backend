var captchapng = require('captchapng');
var express = require('express');
var router = express.Router();
var md5 = require('md5');


function captchas() {
    this.lenght = 0;
}

captchas.prototype.put = function (captcha, value) {
    this.lenght++;
    this[captcha] = value;
}

captchas.prototype.get = function (captcha) {
    return this[captcha];
}

captchas.prototype.delete = function (captcha) {
    this.lenght--;
    delete this[captcha];
}

var captchaList = new captchas();

setInterval(function () {
    Object.keys(captchaList).forEach(function (captcha) {
        if (Date.now() - captchaList.get(captcha).timestamp > 1000 * 60 * 5) {
            captchaList.delete(captcha);
        }
    });
}, 10000);

router.get("/captcha.png", function (req, res) {
    let randNumber = parseInt(Math.random() * 90000 + 10000);
    let captchaValue = {
        timestamp: Date.now()
    }
    captchaList.put(randNumber, captchaValue);
    // console.log(captchaList.lenght);
    if (captchaList.lenght > 1000) captchaList = new captchas();
    var p = new captchapng(80, 30, randNumber); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
});

module.exports.captchaList = captchaList;
module.exports.router = router;