const os = require('os');
const config = require('config');
const interfaces = os.networkInterfaces();
const serverInfo = {
    networkInterfaces: interfaces,
    application: {
        port: config.Application.port
    }
};
module.exports = serverInfo;