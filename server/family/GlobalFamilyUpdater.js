XLSX = require('xlsx');
let models = require('../models-master');
let Family = models.Family;
let EventEmitter = require('events').EventEmitter;

function updateFamily(workbook, sheetName, callback) {
    let worksheet = workbook.Sheets[sheetName];
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    let eventEmitter = new EventEmitter();

    let famyCount = 0;
    let totalFamy = range.e.r - range.s.r;

    eventEmitter.on('famy-done', function () {
        famyCount += 1;
        if (famyCount == totalFamy) {
            console.log("Done Family");
            if (callback) callback();
        }
    });

    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        let aFamily = buildFamily(R, worksheet);
        Family.create({
            idFamily: aFamily.idFamily,
            name: aFamily.name,
            familyGroup: aFamily.familyGroup
        })
            .then(function () {
                eventEmitter.emit('famy-done');
            })
            .catch(function (err) {
                //console.log("FAIL: Family" + aFamily.idFamily + " insert fail");
                eventEmitter.emit('famy-done');
            })

    }
}

function buildFamily(row, sheet) {
    let newComponent = new Object();
    newComponent.idFamily = parseInt(getValueAtCell(row, 0, sheet));
    newComponent.name = getValueAtCell(row, 1, sheet);
    newComponent.familyGroup = getValueAtCell(row, 2, sheet);
    return newComponent;
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
    Family.sync().then(function () {
        let workbook = XLSX.readFile(__dirname + '/Curve_family.xlsx');
        updateFamily(workbook, 'curve_family', callback);
    });
}
