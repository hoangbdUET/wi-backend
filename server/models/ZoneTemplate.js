module.exports = function (sequelize, DataTypes) {
    return sequelize.define('zone_template', {
        idZoneTemplate: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: "name-idZoneSetTemplate"
        },
        background: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        foreground: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'white'
        },
        pattern: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'none'
        },
        orderNum: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '0'
        }
    });
};
