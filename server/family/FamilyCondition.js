module.exports = function (sequelize, DataTypes) {
    return sequelize.define('family_condition', {
        idFamilyCondition:{
            type:DataTypes.INTEGER,
            unique:true,
            primaryKey:true
        },
        curveName:{
            type:DataTypes.STRING(50),
            allowNull:false
        },
        unit:{
            type:DataTypes.STRING(50),
            allowNull:false
        }
    });
};
