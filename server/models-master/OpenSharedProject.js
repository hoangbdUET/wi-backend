module.exports = function (sequelize, DataTypes) {
    return sequelize.define('opening_shared_project', {
        idOpenSharedProject: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        project: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        owner: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    });
};
