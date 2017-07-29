module.exports = function (sequelize, DataTypes) {
    return sequelize.define('track',{
        idTrack:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        orderNum: {
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
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
