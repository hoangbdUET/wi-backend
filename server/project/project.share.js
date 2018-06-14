let wiETL = require('wi-etl');
let config = require('config');
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

// let sourceDb = {
//     host: 'localhost',
//     port: 3306,
//     username: 'root',
//     password: 'qwertyui',
//     database_name: 'wi_hoang',
//     dialect: 'mysql'
// };
// let destinationDb = {
//     host: 'localhost',
//     port: 3306,
//     username: 'root',
//     password: 'qwertyui',
//     database_name: 'wi_test',
//     dialect: 'mysql',
//     source_database: sourceDb.database_name
// };

module.exports = function (project, done, dbConnection, username) {
    dbConnection.sequelize.query("CREATE DATABASE IF NOT EXISTS " + "wi_shared_" + username, {type: dbConnection.sequelize.QueryTypes.RAW}).then(database => {
        if (database[0].warningStatus === 0) {
            console.log("Created database wi_shared_" + username);
        } else {
            console.log("Database wi_shared_" + username + " existed!");
        }
        let srcDb = {
            host: config.Database.host,
            port: config.Database.port,
            username: config.Database.user,
            password: config.Database.password,
            database_name: 'wi_' + username,
            dialect: config.Database.dialect
        };
        let desDb = {
            host: config.Database.host,
            port: config.Database.port,
            username: config.Database.user,
            password: config.Database.password,
            database_name: 'wi_shared_' + username,
            dialect: config.Database.dialect,
            source_database: srcDb.database_name
        };
        wiETL.configSourceDb(srcDb, function () {
            wiETL.configDestinationDb(desDb, function () {
                try {
                    wiETL.executeJob(['family', 'family_spec', 'family_condition', 'project', 'well', 'dataset', 'curve', 'plot', 'cross_plot', 'histogram', 'combined_box', 'annotation', 'depth_axis', 'groups', 'image_track', 'zone_track', 'track', 'object_track', 'image_of_track', 'object_of_track', 'reference_curve', 'marker', 'zone_set', 'zone_track', 'workflow_spec', 'workflow', 'well_header', 'point_set', 'polygon', 'regression_line', 'ternary', 'line', 'shading', 'polygon_regressionline', 'overlay_line', 'combined_box_crossplot', 'combined_box_histogram', 'combined_box_plot', 'combined_box_tool', 'selection_tool', 'user_define_line', 'image'], function () {
                        done(ResponseJSON(ErrorCodes.SUCCESS, "Successful"));
                    });
                } catch (e) {
                    console.log(e);
                }

            });
        });
    });
};