module.exports = function (sequelize, DataTypes) {
    return sequelize.define('plot', {
        idPlot: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: "name-idProject"
        },
        option: {
            type: DataTypes.STRING(250),
            allowNull: true,
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        currentState: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "{}"
        },
        cropDisplay: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        printSetting: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        unit: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: 'm'
        },
        depthRefSpec: {
            type: DataTypes.STRING(50),
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
        paranoid: true
    });
};
