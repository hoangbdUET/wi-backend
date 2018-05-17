module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user_define_line', {
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