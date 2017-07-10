module.exports = function (sequelize, DataTypes) {
    return sequelize.define('dataset', {
        idDataset:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING(50),
            allowNull:false
        },
        idWell:{
            type:DataTypes.INTEGER,
            unique:true,
            allowNull:false
        }
    });
};
