module.exports = function (sequelize, DataTypes) {
    return sequelize.define('depth_axis',{
        idDeathAxis:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        // name:{
        //     type:DataTypes.STRING(50),
        //     allowNull:false
        // },
        // option:{
        //     type:DataTypes.STRING(250),
        //     allowNull:false
        // }
    });
};