module.exports = function (sequelize, DataTypes) {
    return sequelize.define('regressionline', {
        idRegressionLine:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        lineStyle:{
            type:DataTypes.STRING,
            allowNull:false,
            defaultValue: "{color: 'Blue', width: 1, style: []}"
        },
        displayLine:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true
        },
        displayEquation:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:true
        },
        regType:{
            type:DataTypes.ENUM('Linear', 'Exponent', 'Powerwer'),
            allowNull:false,
            defaultValue:'Linear'
        },
        inverseReg:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        exclude:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        fitX:{
            type:DataTypes.DOUBLE,
            allowNull:false,
        },
        fitY:{
            type:DataTypes.DOUBLE,
            allowNull:false,
        }


    });
};
