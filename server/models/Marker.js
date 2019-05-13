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
	    relatedTo: {
		    type: DataTypes.TEXT,
		    allowNull: true,
		    set(value) {
			    this.setDataValue('relatedTo', typeof(value) === 'object' ? JSON.stringify(value) : value);
		    },
		    get() {
			    const value = this.getDataValue('relatedTo');
			    return value ? JSON.parse(value) : null;
		    }
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