module.exports = function (sequelize, DataTypes) {
	return sequelize.define('task', {
		idTask: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: true
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
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		idTaskSpec: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
	});
};
