var models = require('../models');
var Line = models.Line;
var ErrorCodes = require('../../error-codes').CODES;
const ResponseJSON = require('../response');

function createNewLine(lineInfo, done) {
    Line.sync()
        .then(
            function () {
                var line = Line.build({
                    idTrack: lineInfo.idTrack,
                    idCurve:lineInfo.idCurve
                });
                line.save()
                    .then(function (line) {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new line success", line.toJSON()));
                    })
                    .catch(function (err) {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.name+" idTrack not exist"));
                    });
            },
            function () {
                done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
            }
        )

}
function editLine(lineInfo, done) {
    Line.findById(lineInfo.idLine)
        .then(function (line) {
            line.idTrack = lineInfo.idTrack;
            line.save()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Line success", lineInfo));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Line "+err.name));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS,"Line not found for edit"));
        })
}
function deleteLine(lineInfo,done) {
    Line.findById(lineInfo.idLine)
        .then(function (line) {
            line.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Line is deleted", line));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Line"+err.errors[0].message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for delete"));
        })
}
function getLineInfo(line,done) {
    Line.findById(line.idLine,{include:[{all:true,include:[{all:true}]}]})
        .then(function (line) {
            if (!line) throw "not exist";
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get info Line success", line));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Line not found for get info"));
        })
}

module.exports = {
    createNewLine:createNewLine,
    editLine:editLine,
    deleteLine:deleteLine,
    getLineInfo:getLineInfo
};
