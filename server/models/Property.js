module.exports = function (sequelize, DataTypes) {
    return sequelize.define('property', {
        ID_PROPERTY:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ID:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name:{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        unit:{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description:{
            type: DataTypes.STRING(50),
            allowNull:false

        },
        value: {
            type:DataTypes.STRING(250),
            allowNull:false
        }

    });
};
