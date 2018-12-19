module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project', {
        idProject: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        alias:{
            type: DataTypes.STRING,
            allowNull: true
        },
        location: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        company: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        department: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
	    charset: 'utf8',
	    collate: 'utf8_general_ci'
    });
};
