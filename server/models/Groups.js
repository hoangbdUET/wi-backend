module.exports = function (sequelize, DataTypes) {
    return sequelize.define('groups', {
        idGroup: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idParent: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
        }
    });
};
