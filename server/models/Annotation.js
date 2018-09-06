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
            },
            get() {
                const value = this.getDataValue('textStyle');
                return JSON.parse(value);
            }
        },
        vAlign: {
            type: DataTypes.ENUM('top', 'middle', 'bottom'),
            allowNull: false,
            defaultValue: 'middle'
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
        },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    });
}
