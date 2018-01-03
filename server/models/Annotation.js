"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('annotation', {
        idAnnotation: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        text: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: 'Example text'
        },
        textStyle: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '{}',
            set(value) {
                this.setDataValue('textStyle', typeof(value) === 'object' ? JSON.stringify(value) : value);
            }
        },
        vAlign: {
            type: DataTypes.ENUM('Top', 'Center', 'Bottom'),
            allowNull: false,
            defaultValue: 'Center'
        },
        hAlign: {
            type: DataTypes.ENUM('Left', 'Center', 'Right'),
            allowNull: false,
            defaultValue: 'Center'
        },
        background: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: '{}'
        },
        fitBounds: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        deviceSpace: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        vertical: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        shadow: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        left: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        width: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 100
        },
        top: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        bottom: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        }
    });
}