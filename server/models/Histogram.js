"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('histogram', {
        idHistogram: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'BlankHistogram',
            unique: 'name-idWell'
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
        showCumulative: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        plot: {
            type: DataTypes.ENUM('Bar', 'Curve'),
            allowNull: 'false',
            defaultValue: 'Bar',
            validate: {
                isIn: [['Bar', 'Curve']]
            }
        },
        plotType: {
            type: DataTypes.ENUM('Frequency', 'Percent'),
            defaultValue: 'Frequency',
            validate: {
                isIn: [['Frequency', 'Percent']]
            },
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Blue'
        },
        discriminator: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        referenceTopDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceBottomDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceScale: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000
        },
        referenceVertLineNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        referenceDisplay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        referenceShowDepthGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    })
}
