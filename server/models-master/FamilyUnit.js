module.exports = function (sequelize, DataTypes) {
    return sequelize.define('family_unit', {
        idUnit: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        rate: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    });
};
