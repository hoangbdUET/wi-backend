module.exports = function (sequelize, DataTypes) {
    return sequelize.define('overlay_line', {
        idOverlayLine: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        family_group_x: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        family_group_y: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        overlay_line_specs: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });
};
