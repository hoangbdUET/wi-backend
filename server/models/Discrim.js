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
            allowNull: false,
            defaultValue: false
        },
        combine: {
            type: DataTypes.ENUM('and', 'or'),
            allowNull: false,
            defaultValue: 'and'
        },
        func: {
            type: DataTypes.STRING(5),
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(10),
            allowNull: false
        }

    });
};