module.exports = function (sequelize, DataTypes) {
    return sequelize.define('shading', {
        idShading:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true
        },
        shadingName:{
            type:DataTypes.STRING(150),
            allowNull:false,
        },

        leftFixedValue:{
            type:DataTypes.FLOAT,
            allowNull:true
        },
        rightFixedValue:{
            type:DataTypes.FLOAT,
            allowNull:true
        },

        shadingStyle:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true//true is filling pattern
        },
        patternLeftName: {
            type: DataTypes.STRING(30),
            allowNull:false
        },
        patternLeftForeground:{
            type:DataTypes.STRING(50),
            allowNull:true,
        },
        patternLeftBackground:{
            type:DataTypes.STRING(50),
            allowNull:true,
        },
        patternRightName:{
            type: DataTypes.STRING(30),
            allowNull:false
        },
        patternRightForeground:{
            type:DataTypes.STRING(50),
            allowNull:true,
        },
        patternRightBackground:{
            type:DataTypes.STRING(50),
            allowNull:true,
        }
        // vrMinValue: {
        //     type:DataTypes.NUMERIC,
        //     allowNull:true,
        // }
        // vrMaxValue: {
        //
        // },
        // vrMaxColor: {
        //
        // },
        // vrMinColor: {
        //
        // },
        // vrPalete: {
        //     type:DataTypes.STRING
        // },
        // vrFillColors: {
        //     type:DataTypes.TEXT,
        // }
    });
};
