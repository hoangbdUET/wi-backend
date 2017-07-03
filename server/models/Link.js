module.exports = function (sequelize, DataTypes) {
    return sequelize.define('link', {
        idLink: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        idCurve: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    });
};
