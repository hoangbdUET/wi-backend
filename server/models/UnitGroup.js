module.exports = function (sequelize, DataTypes) {
    return sequelize.define('unit_group', {
        idUnitGroup: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(),
            allowNull: false
        }
    });
};
