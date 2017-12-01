module.exports = function (sequelize, DataTypes) {
    return sequelize.define('combined_box_tool', {
        idCombinedBoxTool: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        color: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
};
