module.exports = function (sequelize, DataTypes) {
	return sequelize.define('flow', {
		idFlow: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	});
};
