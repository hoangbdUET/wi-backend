module.exports = function (sequelize, DataTypes) {
	return sequelize.define('management_dashboard', {
		idManagementDashboard: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            default: ""
        }
	});
};