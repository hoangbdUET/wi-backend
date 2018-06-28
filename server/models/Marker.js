"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker', {
        idMarker: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        depth: {
            type: DataTypes.DOUBLE,
            allowNull: false
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