module.exports = function (sequelize, DataTypes) {
    return sequelize.define('combo-box-select', {
        idComboBoxSelect: {
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
