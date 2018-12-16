module.exports = function (sequelize, DataTypes) {
	return sequelize.define('storage_database', {
		idStorageDatabase: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			uniquie: "name-idProject"
		},
		input_directory: {
			type: DataTypes.STRING(250),
			allowNull: true
		},
		company: {
			type: DataTypes.STRING(250),
			allowNull: true,
			defaultValue: 'I2G'
		},
		type: {
			type: DataTypes.STRING(250),
			allowNull: true,
			defaultValue: "INPUT"
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