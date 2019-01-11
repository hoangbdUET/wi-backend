module.exports = function (sequelize, DataTypes) {
	return sequelize.define('image_set_template', {
		idImageSetTemplate: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(200),
			allowNull: false,
			unique: "name-idProject"
		}
	});
};
