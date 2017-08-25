module.exports = function (sequelize, DataTypes) {
    return sequelize.define('crossplot', {
        idCrossPlot:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        name:{
            type:DataTypes.STRING(50),
            allowNull:false,
            defaultValue: "BlankCrossPlot",
            unique:"name-idWell"
        }
    });
};
