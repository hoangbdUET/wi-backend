let Sequelize = require('sequelize');
let config = require('config').Database;


const sequelize = new Sequelize(config.dbName, config.user, config.password, {
    host: config.host,
    define: {
        freezeTableName: true
    },
    dialect: config.dialect,
    port: config.port,
    logging: config.logging,
    pool: {
        max: 20,
        min: 0,
        idle: 200
    },
    operatorsAliases: Sequelize.Op,
    storage: config.storage
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
    'MarkerTemplate',
    'OpenSharedProject',
    'OverlayLine',
    'TaskSpec',
    'UnitGroup',
    'WorkflowSpec',
    'ZoneTemplate'
];
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
    m.Family.hasMany(m.FamilySpec, {foreignKey: 'idFamily'});
    m.FamilySpec.belongsTo(m.UnitGroup, {foreignKey: 'idUnitGroup'});
    m.UnitGroup.hasMany(m.FamilyUnit, {foreignKey: 'idUnitGroup'});
})(module.exports);
module.exports.sequelize = sequelize;
