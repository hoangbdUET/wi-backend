"use strict";

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('analysis', {
		idAnalysis: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(250),
			allowNull: false
		},
		content: {
			type: DataTypes.TEXT('medium'),
			allowNull: true,
			set(value) {
				this.setDataValue('content', typeof(value) === 'object' ? JSON.stringify(value) : value);
			},
			get() {
				const value = this.getDataValue('content');
				return JSON.parse(value);
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
	});
};
