let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let fs = require('fs-extra');
let path = require('path');
let asyncEach = require('async/each');
let Finder = require('fs-finder');

function createNewTernary(ternaryInfo, done, dbConnection) {
    let Ternary = dbConnection.Ternary;
    Ternary.sync()
        .then(function () {
            delete ternaryInfo.idTernary;
            Ternary.build(ternaryInfo)
                .save()
                .then(function (ternary) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new ternary success", ternary));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new ternary error" + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })
};

function editTernary(ternaryInfo, done, dbConnection) {
    let Ternary = dbConnection.Ternary;
    Ternary.findById(ternaryInfo.idTernary)
        .then(function (ternary) {
            delete ternaryInfo.idTernary;
            delete ternaryInfo.idCrossPlot;
            Object.assign(ternary, ternaryInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Ternary success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Ternary err" + err));

                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Ternary not found for edit"));
        })
};

function deleteTernary(ternaryInfo, done, dbConnection) {
    let Ternary = dbConnection.Ternary;
    Ternary.findById(ternaryInfo.idTernary)
        .then(function (ternary) {
            ternary.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Ternary is deleted", ternary));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Ternary : " + err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Ternary not found for delete"));
        });
};

function inforTernary(ternaryInfo, done, dbConnection) {
    let Ternary = dbConnection.Ternary;
    Ternary.findById(ternaryInfo.idTernary).then(ternary => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful !", ternary));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
    })
}

function listTernaryByCrossPlot(ternaryInfo, done, dbConnection) {
    let Ternary = dbConnection.Ternary;
    Ternary.findAll({
        where: {
            idCrossPlot: ternaryInfo.idCrossPlot
        }
    }).then(rs => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Ternary list", rs));
    }).catch(err => {
        console.log(err);
    });
};

function saveTernary(data, done, dbConnection, username) {
    data.content = typeof data.content == 'object' ? JSON.stringify(data.content) : data.content;
    let saveDir = path.join(__dirname, 'data', username);
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
    }
    let file = path.join(saveDir, data.fileName + '.json');
    try {
        if (fs.existsSync(file)) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "File existed"));
        } else {
            fs.createFile(file, function (err) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                fs.outputFile(file, data.content, function (err) {
                    if (err) throw err;
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Done", data.fileName + '.json'));
                });
            });
        }
    } catch (err) {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    }
};

function exportTernary(data, done, dbConnection, username) {
    let saveDir = path.join(__dirname, 'data', username);
    if (!fs.existsSync(saveDir)) {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", []));
    } else {
        Finder.from(saveDir).findFiles('*', function (files) {
            let rs = [];
            asyncEach(files, function (file, next) {
                let filePath = file.replace(/\\/g, '/');
                let fileName = filePath.slice(filePath.lastIndexOf('/') + 1, filePath.length);
                let myObj = {};
                myObj.fileName = fileName;
                fs.readFile(file, 'utf8', function (err, data) {
                    myObj.content = data;
                    rs.push(myObj);
                    next();
                });
            }, function () {
                done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
            });
        });
    }
};

function removeTernary(data, done, dbConnection, username) {
    let saveDir = path.join(__dirname, 'data', username);
    if (!fs.existsSync(saveDir)) {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ternary folder", []));
    } else {
        if (!fs.existsSync(path.join(saveDir, data.fileName + '.json'))) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No ternary found", []));
        } else {
            fs.unlinkSync(path.join(saveDir, data.fileName + '.json'));
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", data.fileName));
        }
    }
};

module.exports = {
    createNewTernary: createNewTernary,
    editTernary: editTernary,
    deleteTernary: deleteTernary,
    inforTernary: inforTernary,
    listTernaryByCrossPlot: listTernaryByCrossPlot,
    saveTernary: saveTernary,
    exportTernary: exportTernary,
    removeTernary: removeTernary
};