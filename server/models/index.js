var Sequelize = require('sequelize');
var config=require('config').Database;


const sequelize = new Sequelize(config.dbName, config.user, config.password,{
    define: {
        freezeTableName: true
    },
    dialect: config.dialect,
    port:config.port,
    logging: config.logging,
    pool:{
        max:20,
        min:0,
        idle:200
    },
    storage:config.storage
});
sequelize.sync()
    .catch(function (err) {
        console.log(err);
    });
var models = [
    'Curve',
    'CurveData',
    'DepthAxis',
    'Plot',
    'Project',
    'Property',
    'Track',
    'Well',
    'WellData',
    'Dataset',
    'Line',
    'Family',
    'FamilyCondition',
    'Shading'
];
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.Project_Well=m.Project.hasMany(m.Well,{foreignKey:{name:"idProject",allowNull:false,unique:"name-idProject"},onDelete:'CASCADE'});
    m.Well_Dataset=m.Well.hasMany(m.Dataset, {foreignKey: {name:"idWell",allowNull:false,unique:"name-idWell"}, onDelete: 'CASCADE'});
    m.Well_Plot=m.Well.hasMany(m.Plot, {foreignKey: {name:"idWell",allowNull:false}, onDelete: 'CASCADE'});

    m.Dataset_Curve=m.Dataset.hasMany(m.Curve, {foreignKey: {name:"idDataset",allowNull:false,unique:"name-idDataset"}, onDelete: 'CASCADE'});
    m.Plot_Track=m.Plot.hasMany(m.Track, {foreignKey: {name:"idPlot",allowNull:false}, onDelete: 'CASCADE'});
    m.Plot_DepthAxis=m.Plot.hasMany(m.DepthAxis, {foreignKey: {name:"idPlot",allowNull:false}, onDelete: 'CASCADE'});
    m.Plot.belongsTo(m.Curve, {foreignKey: 'referenceCurve'});

    m.Track.hasMany(m.Line,{foreignKey:{name:"idTrack",allowNull:false},onDelete:'CASCADE'});
    m.Track.hasMany(m.Shading,{foreignKey:{name:"idTrack",allowNull:false},onDelete:'CASCADE'});
    m.Line.belongsTo(m.Curve,{foreignKey:{name:"idCurve",allowNull:false},onDelete:'CASCADE'});

    m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
    m.Curve.belongsTo(m.Family, {as: 'LineProperty',foreignKey: 'idFamily'});

    m.Shading.belongsTo(m.Line,{foreignKey:'idLeftLine', onDelete:'CASCADE'});
    m.Shading.belongsTo(m.Line,{foreignKey:{name:'idRightLine',allowNull:false},onDelete:'CASCADE'});
    m.Shading.belongsTo(m.Curve, {foreignKey: 'idControlCurve'});
})(module.exports);
module.exports.sequelize = sequelize;
