"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker', {
        idMarker: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        nameHAlign: {
            type: DataTypes.ENUM("Center", "Left", "Right"),
            allowNull: false,
            defaultValue: "Left"
        },
        nameVAlign: {
            type: DataTypes.ENUM("Low", "Center", "High", "None"),
            allowNull: false,
            defaultValue: "None"
        },
        depth: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        precision: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        },
        depthHAlign: {
            type: DataTypes.ENUM("Center", "Left", "Right"),
            allowNull: false,
            defaultValue: "Left"
        },
        depthVAlign: {
            type: DataTypes.ENUM("Low", "Center", "High", "None"),
            allowNull: false,
            defaultValue: "High"
        },
        lineWidth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        },
        lineDash: {
            type: DataTypes.STRING(30),
            defaultValue: ""
        },
        lineColor: {
            type: DataTypes.STRING(30),
            defaultValue: ""
        },
        showSymbol: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        symbolName: {
            type: DataTypes.ENUM("Circle", "Square"),
            allowNull: true,
            defaultValue: "Circle"
        },
        symbolSize: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 15
        },
        symbolStrokeStyle: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        symbolFillStyle: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        symbolLineWidth: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        symbolLineDash: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: ""
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