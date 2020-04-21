let modelMaster = require('../models-master');
let async = require('async');

function sync() {
    return new Promise(function (resolve, reject) {
        let opening = [];
        modelMaster.OpenSharedProject.findAll().then(rows => {
            async.each(rows, function (row, next) {
                opening[row.username + row.client] = {
                    project: row.project,
                    owner: row.owner,
                    client: row.client
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
    // row.client = "WI_ANGULAR";
    return new Promise(function (resolve, reject) {
        modelMaster.OpenSharedProject.findOrCreate({
            where: { username: row.username, client: row.client },
            defaults: { username: row.username, project: row.project, owner: row.owner, client: row.client }
        }).then(rs => {
            resolve(rs);
        }).catch(err => {
            reject(err);
        });
    });
}

function removeRow(row, callback) {
    // row.client = "WI_ANGULAR";
    return new Promise(function (resolve, reject) {
        modelMaster.OpenSharedProject.findOne({ where: { username: row.username, client: row.client } }).then((r => {
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