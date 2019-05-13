let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let async = require('async');

function getListUnitByIdFamily(idFamily, dbConnection) {
    return new Promise(function (resolve) {
        dbConnection.Family.findByPk(idFamily, {
            order: ['name'],
            include: {
                model: dbConnection.FamilySpec,
                as: 'family_spec',
                // where: {isDefault: true}
            }
        }).then(family => {
            if (family.family_spec[0].idUnitGroup) {
                dbConnection.FamilyUnit.findAll({where: {idUnitGroup: family.family_spec[0].idUnitGroup}}).then(units => {
                    resolve(units);
                })
            } else {
                resolve([]);
            }
        });
    });
}

function getListUnitByIdCurve(idCurve, dbConnection) {
    return new Promise(function (resolve) {
        dbConnection.Curve.findByPk(idCurve).then((curve => {
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
    if (data.idCurve) {
        getListUnitByIdCurve(data.idCurve, dbConnection).then(list => {
            callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", list));
        });
    } else {
        if (data.idUnitGroup) {
            dbConnection.FamilyUnit.findAll({
                where: {idUnitGroup: data.idUnitGroup},
                order: ['name']
            }).then(units => {
                // response.sort((a, b) => {
                //     let nameA = a.name.toUpperCase();
                //     let nameB = b.name.toUpperCase();
                //     return nameA === nameB ? 0 : nameA > nameB ? 1 : -1;
                // });
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", units));
            });
        } else {
            getListUnitByIdFamily(data.idFamily, dbConnection).then(list => {
                callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", list));
            });
        }
    }
};
let getAllUnit = function (data, callback, dbConnection) {
    dbConnection.FamilyUnit.findAll({
        order: ['name']
    }).then(units => {
        callback(ResponseJSON(ErrorCodes.SUCCESS, "Successful", units));
    });
};

module.exports = {
    getListUnit: getListUnit,
    getListUnitByIdCurve: getListUnitByIdCurve,
    getListUnitByIdFamily: getListUnitByIdFamily,
    getAllUnit: getAllUnit
};