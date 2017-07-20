XLSX = require('xlsx');
var models = require('../../family');
var FamilyCondition = models.FamilyCondition;

function updateFamilyCondition(workbook, sheetName) {
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);

    for (var R=range.s.r+1;R<=range.e.r;++R) {
        var aFamilyCondition = buildFamilyCondition(R, worksheet);
        FamilyCondition.create({
            idFamilyCondition: aFamilyCondition.idFamilyCondition,
            idFamily: aFamilyCondition.idFamily,
            curveName: aFamilyCondition.curveName,
            unit: aFamilyCondition.unit
        })
            .then(function () {
                console.log("Insert family has idFamilyCondition" + aFamilyCondition.idFamilyCondition + " success");
            })
            .catch(function (err) {
                console.log("FAIL: FamilyCondition" + aFamilyCondition.idFamilyCondition + " Error:" + err);
            });

    }
}
function buildFamilyCondition(row, sheet) {
    var newComponent = new Object();
    newComponent.idFamilyCondition = parseInt(getValueAtCell(row, 0, sheet));
    newComponent.idFamily = parseInt(getValueAtCell(row, 1, sheet));
    newComponent.curveName = getValueAtCell(row, 2, sheet);
    newComponent.unit = getValueAtCell(row, 3, sheet);
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

var workbook = XLSX.readFile('./Curve_family.xlsx');
updateFamilyCondition(workbook, 'family_condition');
