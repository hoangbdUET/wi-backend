let Model = require('../models-master/index').MarkerTemplate;
let async = require('async');
let wixlsx = require('../utils/xlsx');
let path = require('path');


function importMarkerTemplate(callback) {
    let rows = wixlsx.getRows(path.join(__dirname, 'Marker_Template.xlsx'), 'marker_template').splice(1);
    async.each(rows, function (row, next) {
        Model.create({
            idMarkerTemplate: row[0],
            template: row[1],
            name: row[2],
            color: row[3],
            lineStyle: row[4],
            lineWidth: row[5],
            description: row[6]
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

module.exports = {
    importMarkerTemplate: importMarkerTemplate
};