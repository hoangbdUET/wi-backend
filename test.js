let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;
let username = "abc";
let projectName = "projetc";
let wellName = "well";
let datasetName = "datastet";
let curveName = "curve";
let config = {
    curveBasePath: 'C:/data'
};
let path = hashDir.createPath(config.curveBasePath, username + projectName + wellName + datasetName + curveName, curveName + '.txt');

console.log(path);