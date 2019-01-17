let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let models = require('../models-master');
let Family = models.Family;
let FamilyCondition = models.FamilyCondition;
let FamilySpec = models.FamilySpec;
let userModels = require('../models');
let asyncLoop = require('async/each');

function createNewFamily(familyInfo, done) {
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

function editFamily(familyInfo, done) {
    Family.findByPk(familyInfo.idFamily)
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

function deleteFamily(familyInfo, done) {
    Family.findByPk(familyInfo.idFamily)
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

function getFamilyInfo(familyInfo, done) {
    Family.findByPk(familyInfo.idFamily)
        .then(function (family) {
            if (!family) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get family info success", family));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Family not found for get info"));
        });
}

function getFamilyList(done) {
    Family.findAll()
        .then(function (families) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get List Family success", families));
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Get list family err " + err));
        })
}

function checkCurveInFamilyGroup(curveName, curveUnit, familyGroup, callback) {
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

let syncFamily = function (userDbConnection, callback) {
    userDbConnection.Family.destroy({where: {}}).then(() => {
        Family.findAll().then(globalFamilies => {
            asyncLoop(globalFamilies, function (globalFamily, next) {
                globalFamily = globalFamily.toJSON();
                userDbConnection.Family.create(globalFamily).then(() => {
                    next();
                }).catch(err => {
                    next(err);
                });
            }, function (err) {
                if (err) console.log(err);
                callback(null, "DONE ALL FAMILIES");
            });
        }).catch(err => {
            console.log(err);
            callback(err, null);
        });
    }).catch(err => {
        callback(err, null);
    })
};


let syncFamilyCondition = function (userDbConnection, callback) {
    userDbConnection.FamilyCondition.destroy({where: {}}).then(() => {
        FamilyCondition.findAll().then(globalFamilyConditions => {
            asyncLoop(globalFamilyConditions, function (globalFamilyCondition, next) {
                globalFamilyCondition = globalFamilyCondition.toJSON();
                userDbConnection.FamilyCondition.create(globalFamilyCondition).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next(err);
                });
            }, function (err) {
                if (err) console.log(err);
                callback(null, "DONE ALL GLOBAL FAMILY");
            });
        }).catch(err => {
            console.log(err);
            callback(err, null);
        });
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
};

let syncFamilySpec = function (userDbConnection, callback) {
    userDbConnection.FamilySpec.destroy({where: {}}).then(() => {
        FamilySpec.findAll().then(globalFamilySpecs => {
            asyncLoop(globalFamilySpecs, function (globalFamilySpec, next) {
                globalFamilySpec = globalFamilySpec.toJSON();
                userDbConnection.FamilySpec.create(globalFamilySpec).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next(err);
                });
            }, function (err) {
                if (err) console.log(err);
                callback(null, "DONE ALL GLOBAL FAMILY SPEC");
            });
        }).catch(err => {
            console.log(err);
            callback(err, null);
        });
    }).catch(err => {
        console.log(err);
        callback(err, null);
    });
};

let syncFamilyData = function (params, done) {
    let userDbConnection = userModels(config.Database.prefix + params.username, function (err) {
        if (err) {
            return done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        }
    });
    syncFamily(userDbConnection, function (err, result) {
        if (err) {
            console.log(err);
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
        } else {
            console.log("Family sync :  DONE");
            syncFamilyCondition(userDbConnection, function (err, result) {
                if (err) {
                    console.log(err);
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "ERROR", err));
                } else {
                    console.log("Family Conditions sync :  DONE");
                    done(ResponseJSON(ErrorCodes.SUCCESS, "DONE"));
                }
            });
            syncFamilySpec(userDbConnection, function (err, rs) {
                if (err) console.log("Family Spec sync :  Error ", err);
                console.log("Family Spec sync :  DONE");
            });
        }
    });
};

module.exports = {
    checkCurveInFamilyGroup: checkCurveInFamilyGroup,
    createNewFamily: createNewFamily,
    editFamily: editFamily,
    deleteFamily: deleteFamily,
    getFamilyInfo: getFamilyInfo,
    getFamilyList: getFamilyList,
    syncFamilyData: syncFamilyData
}