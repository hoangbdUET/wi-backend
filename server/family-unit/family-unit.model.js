let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function getListUnitByIdFamily(idFamily, dbConnection) {
    return new Promise(function (resolve) {
        dbConnection.Family.findById(idFamily, {
            include: {
                model: dbConnection.FamilySpec,
                as: 'family_spec',
                include: {
                    model: dbConnection.UnitGroup,
                    include: {model: dbConnection.FamilyUnit}
                }
                // where: {isDefault: true}
            }
        }).then(family => {
            if (family.family_spec[0].unit_group) {
                resolve(family.family_spec[0].unit_group.family_units);
            } else {
                resolve([]);
            }
        });
    });
}

function getListUnitByIdCurve(idCurve, dbConnection) {
    return new Promise(function (resolve) {
        dbConnection.Curve.findById(idCurve).then((curve => {
            if (!curve || !curve.idFamily) {
                resolve([]);
            } else {
                getListUnitByIdFamily(curve.idFamily, dbConnection).then(list => {
                    resolve(list);
                });
            }
        }));
    });
}

let getListUnit = function (data, callback, dbConnection) {
    getListUnitByIdFamily(data.idFamily, dbConnection).then(list => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successfull", list));
    });
};

module.exports = {
    getListUnit: getListUnit,
    getListUnitByIdCurve: getListUnitByIdCurve,
    getListUnitByIdFamily: getListUnitByIdFamily
};