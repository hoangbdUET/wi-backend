let Sequelize = require('sequelize');
let config = require('config').Database;


const sequelize = new Sequelize(config.dbName, config.user, config.password, {
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
    'OverlayLine',
    'FamilySpec',
    'WorkflowSpec',
    'OpenSharedProject',
    'ProjectPermission',
    'TaskSpec'
];
models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
    m.Family.hasMany(m.FamilySpec, {foreignKey: 'idFamily'});
    m.OpenSharedProject.hasMany(m.ProjectPermission, {
        foreignKey: {name: 'idOpenSharedProject', allowNull: false},
        onDelete: 'CASCADE'
    });
})(module.exports);
module.exports.sequelize = sequelize;
