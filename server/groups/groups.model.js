var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

function createNewGroup(groupInfo, done, dbConnection) {
    var Groups = dbConnection.Groups;
    Groups.sync()
        .then(function () {
            delete groupInfo.idGroup;
            Groups.build(groupInfo)
                .save()
                .then(function (group) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Create new group success", group));
                })
                .catch(function (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Group's name already exists"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                });
        }, function () {
            done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
        });
}

function editGroup(groupInfo, done, dbConnection) {
    var Groups = dbConnection.Groups;
    Groups.findByPk(groupInfo.idGroup)
        .then(function (group) {
            delete groupInfo.idGroup;
            Object.assign(group, groupInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit group success", result));
                })
                .catch(function (err) {
                    if (err.name === "SequelizeUniqueConstraintError") {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Group's name already exists"));
                    } else {
                        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, err.message, err.message));
                    }
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Group not found for edit"));
        })
}

function deleteGroup(groupInfo, done, dbConnection) {
    var Groups = dbConnection.Groups;
    Groups.findByPk(groupInfo.idGroup)
        .then(function (group) {
            group.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Group is deleted", group));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, err.message, err.message));
                })
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Group not found for delete"));
        });
}

function getGroupInfo(groupInfo, done, dbConnection) {
    var Groups = dbConnection.Groups;
    Groups.findByPk(groupInfo.idGroup, {
        include: {model: dbConnection.Well}
    })
        .then(function (group) {
            if (!group) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get group info success", group));
        })
        .catch(function (err) {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Group not found for get info"));
        })
}

module.exports = {
    createNewGroup: createNewGroup,
    editGroup: editGroup,
    getGroupInfo: getGroupInfo,
    deleteGroup: deleteGroup
};
