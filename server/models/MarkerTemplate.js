module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker_template', {
        idMarkerTemplate: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: "name-idMarkerSetTemplate"
        },
        color: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        lineStyle: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        lineWidth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 2
        },
        orderNum: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '0'
        },
        description: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    });
};
