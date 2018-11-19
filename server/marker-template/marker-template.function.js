let MarkerTemplateModel = require('../models-master/index').MarkerTemplate;
let MarkerSetTemplateModel = require('../models-master/index').MarkerSetTemplate;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');


function importMarkerTemplate(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Marker_Template.xlsx'), 'marker_template').splice(1);
    async.each(rows, function (row, next) {
        MarkerTemplateModel.create({
            idMarkerTemplate: row[0],
            idMarkerSetTemplate: row[1],
            name: row[2],
            color: row[3],
            lineStyle: row[4],
            lineWidth: row[5],
            orderNum: row[6],
            description: row[7]
        }).then(() => {
            next();
        }).catch((err) => {
            next();
        });
    }, function () {
        console.log("Done all marker-template");
        callback();
    });
}

function importMarkerSetTemplate(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Marker_Template.xlsx'), 'marker_set_template').splice(1);
    async.each(rows, function (row, next) {
        MarkerSetTemplateModel.create({
            idMarkerSetTemplate: row[0],
            name: row[1]
        }).then(() => {
            next();
        }).catch((err) => {
            next();
        });
    }, function () {
        console.log("Done all marker-set-template");
        callback();
    });
}

module.exports = {
    importMarkerSetTemplate,
    importMarkerTemplate
};