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
        showOnTrack: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
	    note: {
		    type: DataTypes.STRING(255),
		    allowNull: true,
		    defaultValue: ''
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