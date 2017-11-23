module.exports = function (sequelize, DataTypes) {
    return sequelize.define('selection_point', {
        idSelectionPoint: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Points: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};
