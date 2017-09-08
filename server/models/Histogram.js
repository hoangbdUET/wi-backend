"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('histogram', {
        idHistogram: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        histogramTitle: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        hardCopyWidth: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        hardCopyHeight: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        intervalDepthTop: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        intervalDepthBottom: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        //zone set
        // zone: {
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        // //zone
        activeZone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "All"
        },
        divisions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50
        },
        leftScale: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        rightScale: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        showGaussian: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        loga: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        flipHorizontal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        lineStyle: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: 'Custom'
        },
        lineColor: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Blue'
        },
        plotType: {
            type: DataTypes.ENUM('Frequency', 'Percent'),
            defaultValue: 'Frequency'
        },
        color: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Blue'
        },
        discriminators: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    })
}