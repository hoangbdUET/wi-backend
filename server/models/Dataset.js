module.exports = function (sequelize, DataTypes) {
    return sequelize.define('dataset', {
        idDataset: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: false,
            unique: "name-idWell"
        },
        datasetKey: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        datasetLabel: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        step: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "0"
        },
        top: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "0"
        },
        bottom: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "0"
        },
        unit: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: "M"
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
