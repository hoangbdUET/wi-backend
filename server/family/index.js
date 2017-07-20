var Sequelize = require('sequelize');
var config=require('config').Database;

// const sequelize = new Sequelize(config.dbFamily, config.user, config.password,{
//     define: {
//         freezeTableName: true
//     },
//     dialect: config.dialect
// });
const sequelize = new Sequelize('wi_family', 'root', 'tanlm',{
    define: {
        freezeTableName: true
    },
    dialect: 'mysql',
    pool:{
        max:10,
        min:0,
        idle:50
    }
});
sequelize.sync()
    .catch(function (err) {
        console.log(err);
    });
var models = [
    'Family',
    'FamilyCondition'
];

models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'})
})(module.exports);
module.exports.sequelize = sequelize;
