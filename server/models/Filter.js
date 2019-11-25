module.exports = function (sequelize, DataTypes) {
	return sequelize.define('filter', {
		idFilter: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT('medium'),
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
