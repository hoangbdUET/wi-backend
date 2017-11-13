module.exports = function (sequelize, DataTypes) {
    return sequelize.define('well', {
        idWell: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idProject"
        },
        topDepth: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        bottomDepth: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        step: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    });
};
