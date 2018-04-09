module.exports = function (sequelize, DataTypes) {
    return sequelize.define('groups', {
        idGroup: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: false,
            unique: "name-idProject"
        },
        type: {
            type: DataTypes.STRING(25),
            allowNull: false,
            defaultValue: "Well"
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
