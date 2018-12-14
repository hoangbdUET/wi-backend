module.exports = function (sequelize, DataTypes) {
	return sequelize.define('flow', {
		idFlow: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'name-idProject'
		},
		content: {
			type: DataTypes.TEXT,
			// type: DataTypes.TEXT('long'),
			allowNull: true,
			// set(value) {
			//     this.setDataValue('content', typeof(value) === 'object' ? JSON.stringify(value) : value);
			// },
			// get() {
			//     const value = this.getDataValue('content');
			//     return JSON.parse(value);
			// }
		},
		isTemplate: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
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
