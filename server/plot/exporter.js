module.exports.exportData = function (data, callback) {
    var fs = require('fs');
    let tempfile = require('tempfile')('.json');
    fs.writeFileSync(tempfile, JSON.stringify(data));
    callback(200, tempfile);
};
