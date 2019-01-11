module.exports = function (sequelize, DataTypes) {
	return sequelize.define('image_template', {
		idImageTemplate: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: "name-idImageSetTemplate"
		},
		imageUrl: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		fill: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: 'white'
		},
		orderNum: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '0'
		},
		description: {
			type: DataTypes.STRING(100),
			allowNull: true
		}
	});
};
