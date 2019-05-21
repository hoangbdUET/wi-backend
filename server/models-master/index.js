let Sequelize = require('sequelize');
let config = require('config').Database;


const sequelize = new Sequelize(process.env.BACKEND_DBNAME || config.dbName, process.env.BACKEND_DBUSER || config.user, process.env.BACKEND_DBPASSWORD || config.password, {
    host: process.env.BACKEND_DBHOST || config.host,
    define: {
        freezeTableName: true
    },
    dialect: process.env.BACKEND_DBDIALECT || config.dialect || "mysql",
    port: process.env.BACKEND_DBPORT || config.port,
    logging: false,
    pool: {
        max: 20,
        min: 0,
        idle: 200
    },
    operatorsAliases: Sequelize.Op,
    storage: process.env.BACKEND_DBSTORAGE || config.storage
});
sequelize.sync()
    .catch(function (err) {
        console.log(err);
    });
let models = [
    'Family',
    'FamilyCondition',
    'FamilySpec',
    'FamilyUnit',
    'Flow',
    'MarkerSetTemplate',
    'MarkerTemplate',
    'OpenSharedProject',
    'OverlayLine',
    'ParameterSet',
    'Task',
    'TaskSpec',
    'UnitGroup',
    'WorkflowSpec',
    'ZoneTemplate',
    'ZoneSetTemplate'
];
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
    m.Family.hasMany(m.FamilySpec, {foreignKey: 'idFamily'});
    m.FamilySpec.belongsTo(m.UnitGroup, {foreignKey: 'idUnitGroup'});
    m.UnitGroup.hasMany(m.FamilyUnit, {foreignKey: 'idUnitGroup'});
    m.ZoneSetTemplate.hasMany(m.ZoneTemplate, {foreignKey: 'idZoneSetTemplate'});
    m.MarkerSetTemplate.hasMany(m.MarkerTemplate, {foreignKey: 'idMarkerSetTemplate'});
    m.Flow.hasMany(m.Task, {foreignKey: 'idFlow'});
})(module.exports);
module.exports.sequelize = sequelize;
