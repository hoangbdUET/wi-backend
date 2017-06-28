let readline = require('line-by-line');
let fs = require('fs');

let wlogConfig = require('../wlog.config.js');
const NAMEFILE = wlogConfig.NAMEFILE;
const Settings = wlogConfig.SETTINGS;

let outputDir = Settings.outputDir;

function __extractCurvesFromLAS(url, callbackDataCurve) {
    let rl = new readline(url);
    let empty;
    let count = 0;
    let index;

    rl.on('error', function (err) {
        return callbackDataCurve(err, null);
    });

    rl.on('line', function (line) {

        if (line[0] + line[1] === '~A') {
            empty = line;
            empty = empty.replace(/\s+/g, " ");
            empty = empty.slice(3);
            empty = empty.split(' ');
        }
        else if (line[0].match(/^[0-9]+$/) !== null) {
            line = line.replace(/\s+/g, " ");
            line = line.split(' ');
            for (let i = 0; i < empty.length; i++) {
                let object = [];
                let isFileExist = fs.existsSync(outputDir + NAMEFILE.name[i]);

                if (isFileExist) {
                    let data = fs.readFileSync(outputDir + NAMEFILE.name[i]);
                    if (data.toString().length === 0) {
                        object.push({
                            y: count++,
                            x: line[i]
                        });
                    }

                    else {
                        object = JSON.parse(data);
                        count = object.length;
                        object.push({
                            y: count++,
                            x: line[i]
                        });
                    }

                    index = i;
                    callbackDataCurve(false, object, index);
                }

                else {
                    object.push({
                        y: count,
                        x: line[i]
                    });

                    index = i;
                    callbackDataCurve(false, object, index);
                }
            }
        }
    });

    rl.on('end', function () {
        return console.log('Read finished');
    });
}
function extractCurves(inFile) {
    __extractCurvesFromLAS(inFile, function (err, data, index) {
        let json = JSON.stringify(data, null, 4);
        if(fs.existsSync(outputDir)) {
            fs.writeFileSync(outputDir + NAMEFILE.name[index], json);
        }
        else {
            fs.mkdirSync(outputDir);
            fs.writeFileSync(outputDir + NAMEFILE.name[index], json);
        }
    });
}

function __extractWellFromLAS(url, callbackDataWell) {

    let count = -1;
    let nameFile = url.split('\\');

    fs.exists(nameFile[nameFile.length - 1] + '.json', function (exists) {
        if(exists) {
            return callbackDataWell(exists, null, nameFile[nameFile.length - 1]);
        }

        else {
            let empty;
            let object = {
                section: []
            };
            let json;
            let rl = new readline(url);

            rl.on('err', function (err) {
                return callbackDataWell(err, null, nameFile[nameFile.length - 1]);
            });

            rl.on('line', function (line) {
                if (line[0] + line[1] === '~A') {
                    return ;
                }

                else if (line[0] === '~') {
                    console.log("true");
                    empty = line;
                    object.section.push({name:empty, content:[]});
                    count++;
                    callbackDataWell(false, object, nameFile[nameFile.length - 1]);
                }

                else if(line[0] === ' ') {
                    line = line.replace(":", " ");
                    line = line.replace(/\s+\s/g, "  ");
                    line = line.split('  ');
                    if(object.section[count].name === "~VERSION INFORMATION") {
                        object.section[count].content.push({name:line[0], data:line[1], description:line[2]});
                    }
                    else {
                        object.section[count].content.push({name:line[0], unit:line[1], data:line[2], description:line[3]});
                    }
                    callbackDataWell(false, object, nameFile[nameFile.length - 1]);
                }
            });

            rl.on('end', function () {
                return console.log("Read finished");
            })
        }
    });
}

function extractWell(inFile) {
    __extractWellFromLAS(inFile, function (err, data, nameFile) {
        let json = JSON.stringify(data, null, 4);
        if(fs.existsSync(outputDir)) {
            fs.writeFileSync(outputDir + nameFile + '.json', json);
        }
        else {
            fs.mkdirSync(outputDir);
            fs.writeFileSync(outputDir + nameFile + '.json', json);
        }

    });
}

module.exports.extractCurves = extractCurves;
module.exports.extractWell = extractWell;