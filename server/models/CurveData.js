module.exports = function (sequelize, DataTypes) {
    return sequelize.define('curve_data', {
        idCurve: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        unit:{
            type: DataTypes.STRING(50),
            allowNull:false
        },
        description:{
            type: DataTypes.STRING(50),
            allowNull:false
        },
        value:{
            type: DataTypes.STRING(50),
            allowNull:false
        }
    });

};
