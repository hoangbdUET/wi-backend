module.exports = function (sequelize, DataTypes) {
    return sequelize.define('curve',{
        idCurve:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING(50),
            allowNull:false,
            unique:"name-idDataset"
        },
        dataset:{ // propose to remove
            type:DataTypes.STRING(250),
            allowNull:false
        },
        unit:{
            type:DataTypes.STRING(250),
            allowNull:false
        },

        initValue:{
            type:DataTypes.STRING(250),
            allowNull:false
        },
    });
};
