module.exports = function (sequelize, DataTypes) {
    return sequelize.define('project_permission', {
        idProjectPermission: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        router: {
            type: DataTypes.STRING,
            allowNull: false
        },
        allow: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        }
    });
};
