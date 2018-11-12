module.exports = function (sequelize, DataTypes) {
    return sequelize.define('zone', {
        idZone: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        startDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        endDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        showName: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        showOnTrack: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        orderNum: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '0'
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
