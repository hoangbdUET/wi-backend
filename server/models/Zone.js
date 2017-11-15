module.exports = function (sequelize, DataTypes) {
    return sequelize.define('zone', {
        idZone:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true
        },
        startDepth:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        endDepth:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        fill:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        showName:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true
        },
        name:{
            type:DataTypes.STRING(100),
            allowNull:false//TODO: has defaultValue????
        }
    }, {
        paranoid: true
    });
};
