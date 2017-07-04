var Sequelize = require('sequelize');
var config=require('config').Database;


const sequelize = new Sequelize(config.dbName, config.user, config.password,{
    define: {
        freezeTableName: true
    },
    dialect: config.dialect
});

var models = [
    'Curve',
    'CurveData',
    'DepthAxis',
    'Link',
    'Plot',
    'Project',
    'Property',
    'Track',
    'Well',
    'WellData'
];
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.Project.hasMany(m.Well,{foreignKey:"idProject",onDelete:'CASCADE'});
    m.Well.hasMany(m.Plot, {foreignKey: "idWell", onDelete: 'CASCADE'});
    m.Well.hasMany(m.Curve, {foreignKey: "idWell", onDelete: 'CASCADE'});
    m.Plot.hasMany(m.Track, {foreignKey: "idPlot", onDelete: 'CASCADE'});
    m.Plot.hasMany(m.DepthAxis, {foreignKey: "idPlot", onDelete: 'CASCADE'});
})(module.exports);

module.exports.sequelize = sequelize;