XLSX = require('xlsx');
// var models = require('../models-master');
// var FamilyCondition = models.FamilyCondition;
var EventEmitter = require('events').EventEmitter;

function updateFamilyCondition(workbook, sheetName, callback,dbConnection) {
    var FamilyCondition = dbConnection.FamilyCondition;
    var worksheet = workbook.Sheets[sheetName];
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    var eventEmitter = new EventEmitter();
    
    var fcDoneCount = 0;
    var totalFC = range.e.r - range.s.r;

    eventEmitter.on('fc-done', function() {
        fcDoneCount += 1;
        if (fcDoneCount == totalFC) {
            console.log("Done");
            if( callback ) callback();
        }
    });
    for (var R = range.s.r + 1; R <= range.e.r; ++R) {
        var aFamilyCondition = buildFamilyCondition(R, worksheet);
        FamilyCondition.create({
            idFamilyCondition: aFamilyCondition.idFamilyCondition,
            idFamily: aFamilyCondition.idFamily,
            curveName: aFamilyCondition.curveName,
            unit: aFamilyCondition.unit
        })
            .then(function () {
                eventEmitter.emit('fc-done');
            })
            .catch(function (err) {
                //console.log("FAIL: FamilyCondition" + aFamilyCondition.idFamilyCondition + " Error:" + err);
                eventEmitter.emit('fc-done');
            });

    }
}
/*
*   All columns that be taken value are appear in this function
* */
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


module.exports = function(dbConnection,callback) {
    var FamilyCondition = dbConnection.FamilyCondition;
    FamilyCondition.sync().then( function() {
        var workbook = XLSX.readFile(__dirname + '/Curve_family.xlsx');
        updateFamilyCondition(workbook, 'family_condition', callback,dbConnection);
    });
}
