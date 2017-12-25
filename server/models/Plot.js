module.exports = function (sequelize, DataTypes) {
    return sequelize.define('plot', {
        idPlot: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idWell"
        },
        option: {
            type: DataTypes.STRING(250),
            allowNull: true,
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
