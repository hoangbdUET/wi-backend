module.exports = function (sequelize, DataTypes) {
    return sequelize.define('well', {
        idWell: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idProject"
        },
        topDepth: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        bottomDepth: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        step: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "m"
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
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
        paranoid: true
    });
};
