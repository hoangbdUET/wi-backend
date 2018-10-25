module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker_set_template', {
        idMarkerSetTemplate: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: "name-idProject"
        }
    });
};
