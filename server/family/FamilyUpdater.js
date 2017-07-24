XLSX = require('xlsx');
var models = require('../models');
var Family = models.Family;
Family.sync();

function updateFamily(workbook, sheetName) {
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);

    for (var R = range.s.r + 1; R <= range.e.r; ++R) {
        var aFamily = buildFamily(R, worksheet);
        Family.create({
            idFamily: aFamily.idFamily,
            name: aFamily.name,
            familyGroup: aFamily.familyGroup,
            unit: aFamily.unit,
            minScale: aFamily.minScale,
            maxScale: aFamily.maxScale,
            displayType: aFamily.displayType,
            displayMode: aFamily.displayMode,
            blockPosition: aFamily.blockPosition,
            lineStyle: aFamily.lineStyle,
            lineWidth: aFamily.lineWidth,
            lineColor: aFamily.lineColor
        })
            .then(function () {
                console.log("Insert family has idFamily" + aFamily.idFamily + " success");
            })
            .catch(function (err) {
                console.log("FAIL: Family" + aFamily.idFamily + " insert fail");
            })

    }
}

function buildFamily(row, sheet) {
    var newComponent = new Object();
    newComponent.idFamily = parseInt(getValueAtCell(row, 0, sheet));
    newComponent.name = getValueAtCell(row, 1, sheet);
    newComponent.familyGroup = getValueAtCell(row, 2, sheet);
    newComponent.unit = getValueAtCell(row, 3, sheet);
    newComponent.minScale = parseFloat(getValueAtCell(row, 4, sheet));
    newComponent.maxScale = parseFloat(getValueAtCell(row, 5, sheet));
    newComponent.displayType = getValueAtCell(row, 6, sheet);
    newComponent.displayMode = getValueAtCell(row, 7, sheet);
    newComponent.blockPosition = getValueAtCell(row, 8, sheet);
    newComponent.lineStyle = getValueAtCell(row, 13, sheet);
    newComponent.lineWidth = parseInt(getValueAtCell(row, 10, sheet));
    newComponent.lineColor = getValueAtCell(row, 11, sheet);
    return newComponent;
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

var workbook = XLSX.readFile(__dirname + '/Curve_family.xlsx');
updateFamily(workbook, 'curve_family');
