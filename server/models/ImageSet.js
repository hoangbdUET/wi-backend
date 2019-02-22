module.exports = function (sequelize, DataTypes) {
	return sequelize.define('image_set', {
		idImageSet: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: "name-idWell"
		},
		duplicated: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
		},
		note: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: ''
		},
		lockable: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0
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
