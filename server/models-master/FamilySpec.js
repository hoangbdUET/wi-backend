module.exports = function (sequelize, DataTypes) {
    return sequelize.define('family_spec', {
        idFamilySpec: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        minScale: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        maxScale: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        displayType: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        displayMode: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        blockPosition: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        lineStyle: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        lineWidth: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        lineColor: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: 'NUMBER'
        }
    });
};
