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
        }
    });
};
