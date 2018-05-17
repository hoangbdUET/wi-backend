module.exports = function (sequelize, DataTypes) {
    return sequelize.define('image', {
        idImage:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        location:{
            type:DataTypes.STRING,
            allowNull:false,
            defaultValue:''
        },
        top:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        bottom:{
            type:DataTypes.FLOAT,
            allowNull:false
        },
        width:{
            type:DataTypes.FLOAT,
            allowNull:false,
            defaultValue:50
        },
        left:{
            type:DataTypes.FLOAT,
            allowNull:false,
            defaultValue:50
        },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(50),
            allowNull: false
        }

    })
};
