XLSX = require('xlsx');
var EventEmitter = require('events').EventEmitter;
var OverlayLineModel = require('../models-master').OverlayLine;

function updateOverlayLine(workbook, sheetName, callback) {
    var eventEmitter = new EventEmitter();
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    var rowCount = 0;
    var totalRow = range.e.r - range.s.r;

    eventEmitter.on('row-done', function () {
        rowCount += 1;
        if (rowCount == totalRow) {
            if (callback) callback();
        }
    });

    for (var R = range.s.r + 1; R <= range.e.r; ++R) {
        let aRow = buildData(R, worksheet);
        OverlayLineModel.create(aRow).then(rs => {
        }).catch(err => {
        });
        eventEmitter.emit('row-done');
        // console.log(aRow);
    }
}

function buildData(row, sheet) {
    let result = new Object();
    result.idOverlayLine = getValueAtCell(row, 0, sheet);
    result.family_group_x = getValueAtCell(row, 1, sheet);
    result.family_group_y = getValueAtCell(row, 2, sheet);
    result.name = getValueAtCell(row, 3, sheet);
    result.overlay_line_specs = getValueAtCell(row, 4, sheet);
    return result;
}

function getValueAtCell(rowIndex, colIndex, sheet) {
    var cellPositionObject = {r: rowIndex, c: colIndex};
    var cellPositionString = XLSX.utils.encode_cell(cellPositionObject);
    var cell = sheet[cellPositionString];
    if (typeof cell === 'undefined') {
        return "";
    }
    return cell.v;
}

module.exports = function (callback) {
    OverlayLineModel.sync().then(function () {
        let workbook = XLSX.readFile(__dirname + '/specs/overlay_line_spec.xlsx');
        let sheetName = "overlay_line";
        updateOverlayLine(workbook, sheetName, callback);
    });
}