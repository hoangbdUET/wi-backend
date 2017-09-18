module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user-define-line', {
        idUserDefineLine: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        function: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        lineStyle: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        displayLine: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        displayEquation: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
};