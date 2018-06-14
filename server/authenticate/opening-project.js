let modelMaster = require('../models-master');
let async = require('async');

function sync() {
    return new Promise(function (resolve, reject) {
        let opening = [];
        modelMaster.OpenSharedProject.findAll().then(rows => {
            async.each(rows, function (row, next) {
                opening[row.username] = {
                    project: row.project,
                    owner: row.owner
                };
                next();
            }, function () {
                // console.log("Sync opening table Successful");
                resolve(opening);
            });
        });
    });
}

function addRow(row, callback) {
    return new Promise(function (resolve, reject) {
        modelMaster.OpenSharedProject.findOrCreate({
            where: {username: row.username},
            defaults: {username: row.username, project: row.project, owner: row.owner}
        }).then(rs => {
            resolve(rs);
        }).catch(err => {
            reject(err);
        });
    });
}

function removeRow(row, callback) {
    return new Promise(function (resolve, reject) {
        modelMaster.OpenSharedProject.findOne({where: {username: row.username}}).then((r => {
            if (r) {
                r.destroy().then(() => {
                    resolve(r);
                })
            } else {
                resolve();
            }
        })).catch(err => {
            reject(err);
        })
    });
}

module.exports = {
    addRow: addRow,
    sync: sync,
    removeRow: removeRow
};