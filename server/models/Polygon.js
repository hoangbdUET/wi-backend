module.exports = function (sequelize, DataTypes) {
    return sequelize.define('polygon', {
        idPolygon:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        lineStyle:{
            type:DataTypes.STRING(60),
            allowNull:false,
            //TODO need default value
        },
        display:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        points:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(50),
            allowNull: false
        }


    });
};
