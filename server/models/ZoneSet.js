module.exports = function (sequelize, DataTypes) {
    return sequelize.define('zoneset', {
        idZoneSet: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: "name-idWell"
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        paranoid: true
    });
};
