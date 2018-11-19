const os = require('os');
const config = require('config');
const interfaces = os.networkInterfaces();
let host = null;
Object.keys(interfaces).forEach(function (dev) {
    interfaces[dev].forEach(function (details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
            host = details.address;
        }
    });
});
const serverInfo = {
    networkInterfaces: interfaces,
    application: {
        port: config.Application.port,
        host: host
    }
};
const serverAddress = host + ':' + config.Application.port;
module.exports = {
    serverInfo,
    serverAddress
};