module.exports = function (sequelize, DataTypes) {
	return sequelize.define('image', {
		idImage: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		showOnTrack: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		topDepth: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		bottomDepth: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		right: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 50
		},
		left: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 50
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
