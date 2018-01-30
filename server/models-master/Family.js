module.exports = function (sequelize, DataTypes) {
    return sequelize.define('family', {
        idFamily: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(),
            allowNull: false
        },
        familyGroup: {
            type: DataTypes.STRING(),
            allowNull: false
        }
    });
};
