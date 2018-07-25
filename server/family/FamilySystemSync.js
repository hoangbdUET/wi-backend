let wixlsx = require('../utils/xlsx');
let path = require('path');
let async = require('async');
let modelMaster = require('../models-master');
let filePath = path.join(__dirname, 'Curve_family.xlsx');

let syncFamily = function (callback) {
    let families = wixlsx.getRows(filePath, 'curve_family').splice(1);
    async.each(families, function (family, next) {
        modelMaster.Family.create({
            idFamily: family[0],
            name: family[1],
            familyGroup: family[2]
        }).then(() => {
            next();
        }).catch(err => {
            next();
        })
    }, function () {
        callback();
    });
};
let syncFamilySpec = function (callback) {
    let familySpecs = wixlsx.getRows(filePath, 'family_spec').splice(1);
    async.each(familySpecs, function (familySpec, next) {
        modelMaster.FamilySpec.create({
            idFamilySpec: familySpec[0],
            idFamily: familySpec[1],
            unit: familySpec[2] || null,
            minScale: isNaN(parseFloat(familySpec[3])) ? null : parseFloat(familySpec[3]),
            maxScale: isNaN(parseFloat(familySpec[4])) ? null : parseFloat(familySpec[4]),
            displayType: familySpec[5],
            displayMode: familySpec[6],
            blockPosition: familySpec[7],
            lineStyle: familySpec[11],
            lineWidth: familySpec[9],
            lineColor: familySpec[10],
            isDefault: familySpec[12],
            idUnitGroup: isNaN(parseInt(familySpec[13])) ? null: parseInt(familySpec[13])
        }).then(() => {
            next();
        }).catch(err => {
            // console.log(err);
            next();
        })
    }, function () {
        callback();
    });
};
let syncFamilyCondition = function (callback) {
    let conditions = wixlsx.getRows(filePath, 'family_condition').splice(1);
    async.each(conditions, function (condition, nextG) {
        modelMaster.FamilyCondition.create({
            idFamilyCondition: condition[0],
            idFamily: condition[1],
            curveName: condition[2],
            unit: condition[3]
        }).then(() => {
            nextG();
        }).catch(err => {
            nextG();
        });
    }, function () {
        callback();
    });
};

let syncFamilyUnitGroup = function (callback) {
    let groups = wixlsx.getRows(filePath, 'unit_group').splice(1);
    async.each(groups, function (group, nextG) {
        modelMaster.UnitGroup.create({
            idUnitGroup: group[0],
            name: group[1]
        }).then(() => {
            nextG();
        }).catch(err => {
            nextG();
        });
    }, function () {
        callback();
    });
};

let syncFamilyUnit = function (callback) {
    let units = wixlsx.getRows(filePath, 'unit').splice(1);
    async.each(units, function (unit, nextG) {
        modelMaster.FamilyUnit.create({
            idUnit: unit[0],
            name: unit[1],
            rate: unit[4],
            idUnitGroup: unit[3]
        }).then(() => {
            nextG();
        }).catch(err => {
            nextG();
        });
    }, function () {
        callback();
    });
};

module.exports = function (callback) {
    syncFamily(function () {
        console.log("Done family");
        syncFamilyUnitGroup(function () {
            console.log("Done family unit group");
            syncFamilyCondition(function () {
                console.log("Done family condition");
            });
            syncFamilySpec(function () {
                console.log("Done family spec");
            });
            syncFamilyUnit(function () {
                console.log("Done family unit");
            });
            callback();
        });
    });
};