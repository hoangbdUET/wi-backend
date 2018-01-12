XLSX = require('xlsx');
let models = require('../models-master');
let FamilyCondition = models.FamilyCondition;
let FamilySpec = models.FamilySpec;
let EventEmitter = require('events').EventEmitter;

function updateFamilyCondition(workbook, sheetName, callback) {
    let worksheet = workbook.Sheets[sheetName];
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    let eventEmitter = new EventEmitter();
    let fcDoneCount = 0;
    let totalFC = range.e.r - range.s.r;

    eventEmitter.on('fc-done', function () {
        fcDoneCount += 1;
        if (fcDoneCount == totalFC) {
            console.log("Done Family Conditions");
            if (callback) callback();
        }
    });
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        let aFamilyCondition = buildFamilyCondition(R, worksheet);
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

function updateFamilySpec(workbook, sheetName, callback) {
    let worksheet = workbook.Sheets[sheetName];
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    let eventEmitter = new EventEmitter();
    let fcDoneCount = 0;
    let totalFC = range.e.r - range.s.r;

    eventEmitter.on('fc-done', function () {
        fcDoneCount += 1;
        if (fcDoneCount == totalFC) {
            console.log("Done Family Spec");
            if (callback) callback();
        }
    });
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        let aFamilySpec = buildFamilySpec(R, worksheet);
        FamilySpec.create({
            idFamilySpec: aFamilySpec.idFamilySpec,
            idFamily: aFamilySpec.idFamily,
            unit: aFamilySpec.unit,
            minScale: aFamilySpec.minScale,
            maxScale: aFamilySpec.maxScale,
            displayType: aFamilySpec.displayType,
            displayMode: aFamilySpec.displayMode,
            blockPosition: aFamilySpec.blockPosition,
            lineStyle: aFamilySpec.lineStyle,
            lineWidth: aFamilySpec.lineWidth,
            lineColor: aFamilySpec.lineColor,
            isDefault: aFamilySpec.isDefault
        })
            .then(function () {
                eventEmitter.emit('fc-done');
            })
            .catch(function (err) {
                // console.log("FAIL: FamilyCondition" + aFamilySpec.idFamilySpec + " Error:" + err);
                eventEmitter.emit('fc-done');
            });

    }
}

/*
*   All columns that be taken value are appear in this function
* */
function buildFamilyCondition(row, sheet) {
    let newComponent = new Object();
    newComponent.idFamilyCondition = parseInt(getValueAtCell(row, 0, sheet));
    newComponent.idFamily = parseInt(getValueAtCell(row, 1, sheet));
    newComponent.curveName = getValueAtCell(row, 2, sheet);
    newComponent.unit = getValueAtCell(row, 3, sheet);
    return newComponent;
}

function buildFamilySpec(row, sheet) {
    let newComponent = new Object();
    newComponent.idFamilySpec = parseInt(getValueAtCell(row, 0, sheet));
    newComponent.idFamily = parseInt(getValueAtCell(row, 1, sheet));
    newComponent.unit = getValueAtCell(row, 2, sheet);
    newComponent.minScale = parseFloat(getValueAtCell(row, 3, sheet));
    newComponent.maxScale = parseFloat(getValueAtCell(row, 4, sheet));
    newComponent.displayType = getValueAtCell(row, 5, sheet);
    newComponent.displayMode = getValueAtCell(row, 6, sheet);
    newComponent.blockPosition = getValueAtCell(row, 7, sheet);
    newComponent.lineWidth = getValueAtCell(row, 9, sheet);
    newComponent.lineColor = getValueAtCell(row, 10, sheet);
    newComponent.lineStyle = getValueAtCell(row, 11, sheet);
    newComponent.isDefault = getValueAtCell(row, 12, sheet) === 'true' ? true : false;
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
    FamilyCondition.sync().then(function () {
        let workbook = XLSX.readFile(__dirname + '/Curve_family.xlsx');
        updateFamilyCondition(workbook, 'family_condition', function () {
            FamilySpec.sync().then(function () {
                updateFamilySpec(workbook, 'family_spec', callback);
            });
        });
    });
}
