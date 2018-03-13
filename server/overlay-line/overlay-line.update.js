XLSX = require('xlsx');
let EventEmitter = require('events').EventEmitter;
let OverlayLineModel = require('../models-master').OverlayLine;

function updateOverlayLine(workbook, sheetName, callback) {
    let eventEmitter = new EventEmitter();
    let worksheet = workbook.Sheets[sheetName];
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    let rowCount = 0;
    let totalRow = range.e.r - range.s.r;

    eventEmitter.on('row-done', function () {
        rowCount += 1;
        if (rowCount == totalRow) {
            if (callback) callback();
        }
    });

    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
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
    let cellPositionObject = {r: rowIndex, c: colIndex};
    let cellPositionString = XLSX.utils.encode_cell(cellPositionObject);
    let cell = sheet[cellPositionString];
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