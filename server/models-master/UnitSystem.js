module.exports = function (sequelize, DataTypes) {
    return sequelize.define('unit_system', {
        idUnit: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        }
    });
};
