'use strict';
let CONFIG = require('./crypto.config').CONFIG;
let cypher = CONFIG.cypher;
let secret = CONFIG.secret;
const crypto = require('crypto');
const fs = require('fs');

function decoding(inpurURL, callbackGetData) {
    let decrypted;
    fs.readFile(inpurURL, function (err, data) {
        if (err) {
            return callbackGetData(err, null);
        }
        const decipher = crypto.createDecipher(cypher, secret);
        decrypted = decipher.update(data, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        callbackGetData(false, decrypted);
    });
}

module.exports.decoding = decoding;
