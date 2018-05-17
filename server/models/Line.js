module.exports = function (sequelize, DataTypes) {
    return sequelize.define('line', {
        idLine: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        showHeader: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        showDataset: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        minValue: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },//Family
        maxValue: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 200
        },//Family
        autoValueScale: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        displayMode: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'Line'
        },//Family
        wrapMode: {
            type: DataTypes.ENUM('None', 'Left', 'Right', 'Both'),
            allowNull: false,
            defaultValue: 'None'
        },
        blockPosition: {
            type: DataTypes.ENUM('None', 'Start', 'Middle', 'End'),
            allowNull: false,
            defaultValue: 'None'
        },//Family
        ignoreMissingValues: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        displayType: {
            type: DataTypes.ENUM('Linear', 'Logarithmic'),
            allowNull: false,
            defaultValue: 'Linear'
        },//Family
        displayAs: {
            type: DataTypes.ENUM('Normal', 'Cumulative', 'Mirror', 'Pid'),
            allowNull: false,
            defaultValue: 'Normal'
        },
        lineStyle: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: "[0]"
        },//Family
        lineWidth: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
        },//Family
        lineColor: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: "red"
        },//Family
        symbolName: {
            type: DataTypes.ENUM('Circle', 'Cross', 'Diamond', 'Dot', 'Plus', 'Square', 'Star', 'Triangle'),
            allowNull: true,
            defaultValue: 'Circle'
        },
        symbolSize: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 5
        },
        symbolLineWidth: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
        },
        symbolStrokeStyle: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: "red"
        },
        symbolFillStyle: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: "red"
        },
        symbolLineDash: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: "[0]"
        },
        alias: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "N/A"
        },
        orderNum: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'a'
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
