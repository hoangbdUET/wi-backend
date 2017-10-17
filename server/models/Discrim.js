module.exports = function (sequelize, DataTypes) {
    return sequelize.define('discrim', {
        idDiscrim: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        use: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
};