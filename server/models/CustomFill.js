"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('custom_fill', {
        idCustomFill: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT('medium'),
            allowNull: false,
            set(value) {
                this.setDataValue('content', typeof(value) === 'object' ? JSON.stringify(value) : value);
            },
            get() {
                const value = this.getDataValue('content');
                return JSON.parse(value);
            }
        }
    });
}