let modelMaster = require('../models-master');
let async = require('async');

let syncFamily = function (userDbConnection, callback) {
    userDbConnection.Family.destroy({where: {}}).then(() => {
        modelMaster.Family.findAll().then(families => {
            async.each(families, function (family, next) {
                userDbConnection.Family.create(family.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncFamilySpec = function (userDbConnection, callback) {
    userDbConnection.FamilySpec.destroy({where: {}}).then(() => {
        modelMaster.FamilySpec.findAll().then(familie_specs => {
            async.each(familie_specs, function (family_spec, next) {
                userDbConnection.FamilySpec.create(family_spec.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncFamilyCondition = function (userDbConnection, callback) {
    userDbConnection.FamilyCondition.destroy({where: {}}).then(() => {
        modelMaster.FamilyCondition.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.FamilyCondition.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncUnitGroup = function (userDbConnection, callback) {
    userDbConnection.UnitGroup.destroy({where: {}}).then(() => {
        modelMaster.UnitGroup.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.UnitGroup.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncFamilyUnit = function (userDbConnection, callback) {
    userDbConnection.FamilyUnit.destroy({where: {}}).then(() => {
        modelMaster.FamilyUnit.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.FamilyUnit.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncOverlayLine = function (userDbConnection, callback) {
    userDbConnection.OverlayLine.destroy({where: {}}).then(() => {
        modelMaster.OverlayLine.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.OverlayLine.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncTaskSpec = function (userDbConnection, callback) {
    userDbConnection.TaskSpec.destroy({where: {}}).then(() => {
        modelMaster.TaskSpec.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.TaskSpec.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncWorkflowSpec = function (userDbConnection, callback) {
    userDbConnection.WorkflowSpec.destroy({where: {}}).then(() => {
        modelMaster.WorkflowSpec.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.WorkflowSpec.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};
let syncZoneTemplate = function (userDbConnection, callback) {
    userDbConnection.ZoneTemplate.destroy({where: {}}).then(() => {
        modelMaster.ZoneTemplate.findAll().then(rss => {
            async.each(rss, function (rs, next) {
                userDbConnection.ZoneTemplate.create(rs.toJSON()).then(() => {
                    next();
                }).catch(err => {
                    console.log(err);
                    next();
                })
            }, function () {
                callback();
            });
        });
    });
};

module.exports = function (userDbConnection, callback) {
    syncFamily(userDbConnection, function () {
        console.log("Done family");
        syncUnitGroup(userDbConnection, function () {
            console.log("Done family unit group");
            syncFamilySpec(userDbConnection, function () {
                console.log("Done family spec");
            });
            syncFamilyCondition(userDbConnection, function () {
                console.log("Done family condition");
            });
            syncOverlayLine(userDbConnection, function () {
                console.log("Done overlay line");
            });
            syncFamilyUnit(userDbConnection, function () {
                console.log("Done family unit");
            });
            syncTaskSpec(userDbConnection, function () {
                console.log("Done task spec");
            });
            syncWorkflowSpec(userDbConnection, function () {
                console.log("Done workflow spec");
            });
            syncZoneTemplate(userDbConnection, function () {
                console.log("Done zone template");
            });
            callback();
        });
    });
};