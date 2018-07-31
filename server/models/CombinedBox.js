module.exports = function (sequelize, DataTypes) {
    return sequelize.define('combined_box', {
        idCombinedBox: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idProject"
        },
        selection: {
            type: DataTypes.TEXT,
            allowNull: false
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
