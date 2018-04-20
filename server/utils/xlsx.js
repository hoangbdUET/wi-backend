let xlsx = require('xlsx');

function getRows(filePath, sheet) {
    let workbook = xlsx.readFile(filePath);
    let worksheet = workbook.Sheets[sheet];
    let range = xlsx.utils.decode_range(worksheet['!ref']);
    let totalRow = range.e.r - range.s.r + 1;
    let totalCol = range.e.c - range.s.c + 1;
    let rows = [];
    for (let i = 0; i < totalRow; i++) {
        rows.push(getRow(i, totalCol, worksheet));
    }
    return rows;
}

function getRow(rowNumber, totalCol, worksheet) {
    let row = [];
    for (let i = 0; i < totalCol; i++) {
        row.push(getValueAtCell(rowNumber, i, worksheet));
    }
    return row;
}

function getValueAtCell(rowIndex, colIndex, sheet) {
    let cellPositionObject = {r: rowIndex, c: colIndex};
    let cellPositionString = xlsx.utils.encode_cell(cellPositionObject);
    let cell = sheet[cellPositionString];
    if (typeof cell === 'undefined') {
        return "";
    }
    return cell.v;
}

function exportDataToXLSX(data, sheetName, callback) {
    try {
        let XLSX = require('xlsx');
        let tempfile = require('tempfile')('.xlsx');
        let ws = XLSX.utils.aoa_to_sheet(data);
        let wb = {SheetNames: [], Sheets: {}};
        wb.SheetNames.push(sheetName);
        wb.Sheets[sheetName] = ws;
        XLSX.writeFile(wb, tempfile);
        callback(null, tempfile);
    } catch (err) {
        console.log(err);
        callback(err, null);
    }
}

// let data = [
//     [1, 2, 3],
//     ['hoang', 'bui', 'dang'],
//     ['hoang', 'bui', 'dang']
// ];
// exportDataToXLSX(data, 'test', function (err, file) {
//     if (!err) console.log(file)
// });
// console.log(getRows('D:\\Workspace\\wi-backend\\server\\task\\task-spec.xlsx', 'task-spec'));
module.exports = {
    getRows: getRows,
    exportDataToXLSX: exportDataToXLSX
};