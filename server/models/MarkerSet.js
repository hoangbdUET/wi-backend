module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker_set', {
        idMarkerSet: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: 'name-idWell'
        },
        duplicated: {
            type: DataTypes.INTEGER,
            defaultValue: 1
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