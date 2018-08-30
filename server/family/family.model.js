let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncEach = require('async/each');

function createNewFamily(familyInfo, done, dbConnection) {
    let Family = dbConnection.Family;
    Family.sync()
        .then(function () {
            delete familyInfo.idFamily;
            Family.build(familyInfo)
                .save()
                .then(function (family) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Family success", family));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Family " + err));
                })
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        })

}

function editFamily(familyInfo, done, dbConnection) {
    let Family = dbConnection.Family;
    Family.findById(familyInfo.idFamily)
        .then(function (family) {
            delete familyInfo.idFamily;
            Object.assign(family, familyInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Family success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Family " + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Family not found for edit"));
        })
}

function deleteFamily(familyInfo, done, dbConnection) {
    let Family = dbConnection.Family;
    Family.findById(familyInfo.idFamily)
        .then(function (family) {
            family.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Family is deleted", family));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Family not found for delete"));
        })
}

function getFamilyInfo(familyInfo, done, dbConnection) {
    let Family = dbConnection.Family;
    Family.findById(familyInfo.idFamily)
        .then(function (family) {
            if (!family) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get family info success", family));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Family not found for get info"));
        })
}

function getFamilyList(done, dbConnection) {
    let Family = dbConnection.Family;
    Family.all({
        order: ['name'],
        include: {
            model: dbConnection.FamilySpec,
            'as': 'family_spec'
        },
    })
        .then(function (families) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get List Family success", families));
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Get list family err " + err));
        })
}

function checkCurveInFamilyGroup(curveName, curveUnit, familyGroup, dbConnection, callback) {
    let Family = dbConnection.Family;
    let FamilyCondition = dbConnection.FamilyCondition;
    FamilyCondition.findAll().then(conditions => {
        let result = conditions.find(function (aCondition) {
            return new RegExp("^" + aCondition.curveName + "$").test(curveName) && new RegExp("^" + aCondition.unit + "$").test(curveUnit);
        });
        if (!result) {
            return callback(null, 0);
        } else {
            result.getFamily().then(aFamily => {
                for (let key in familyGroup) {
                    if (familyGroup[key] == 'true') {
                        if (aFamily.familyGroup == key) {
                            return callback(null, 1);
                        }
                    }
                }
                return callback(null, 0);
            });

        }
    });
}

function editFamilySpec(data, done, dbConnection) {
    dbConnection.FamilySpec.findAll({where: {idFamily: data.idFamily}}).then(familySpecs => {
        if (!familySpecs) {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No family spec"));
        } else {
            asyncEach(familySpecs, function (familySpec, next) {
                if (familySpec.idFamilySpec == data.idFamilySpec) {
                    familySpec.isDefault = true;
                    familySpec.save().then(() => {
                        next();
                    }).catch(err => {
                        console.log(err);
                    })
                } else {
                    familySpec.isDefault = false;
                    familySpec.save().then(() => {
                        next();
                    }).catch(err => {
                        console.log(err);
                    })
                }
            }, function (err) {
                if (err) {
                    return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
                }
                return done(ResponseJSON(ErrorCodes.SUCCESS, "Succeffull"));
            });
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
    });
}

module.exports = {
    checkCurveInFamilyGroup: checkCurveInFamilyGroup,
    createNewFamily: createNewFamily,
    editFamily: editFamily,
    deleteFamily: deleteFamily,
    getFamilyInfo: getFamilyInfo,
    getFamilyList: getFamilyList,
    editFamilySpec: editFamilySpec
}