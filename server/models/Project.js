module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project',{
        idProject:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        name:{
            type:DataTypes.STRING(50),
            allowNull:false,
            validate:{
                notEmpty:true
            }
        },
        location:{
            type:DataTypes.STRING(250),
            allowNull:false
        },
        company:{
            type:DataTypes.STRING(250),
            allowNull:false
        },
        department:{
            type:DataTypes.STRING(250),
            allowNull:false
        },
        description:{
            type:DataTypes.STRING(250),
            allowNull:false
        }
    });
};
