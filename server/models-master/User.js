module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        idUser:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true
        },
        username:{
            type:DataTypes.STRING(150),
            allowNull:false,
            unique:true
        },
        password:{
            type:DataTypes.STRING(150),
            allowNull:false
        }
    });
};
