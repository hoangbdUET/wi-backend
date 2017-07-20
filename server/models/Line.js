module.exports = function (sequelize, DataTypes) {
    return sequelize.define('line',{
        idLine:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        showHeader:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true
        },
        showDataset:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        /*minValue:{
            type:
        },
        maxValue:{
            type
        },*///TODO min max Value
        autoValueScale:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        displayMode:{
            type:DataTypes.ENUM('Line','Symbol','Both','None'),
            allowNull:false,
            defaultValue:'Line'
        },
        wrapMode:{
            type:DataTypes.ENUM('None','Left','Right','Both'),
            allowNull:false,
            defaultValue:'None'
        },
        blockPosition:{
            type:DataTypes.ENUM('None','Start','Middle','End'),
            allowNull:false,
            defaultValue:'None'
        },
        ignoreMissingValues:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        logLinear:{
            type:DataTypes.ENUM('Linear','Logarithmic'),
            allowNull:false,
            defaultValue:'Linear'
        },
        displayAs:{
            type:DataTypes.ENUM('Normal','Cumulative','Mirror','Pid'),
            allowNull:false,
            defaultValue:'Normal'
        },
        // lineStyle:{
        //
        // }//TODO style css for Line Style
    });
};
