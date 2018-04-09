module.exports = function (sequelize, DataTypes) {
    return sequelize.define('object_of_track', {
        idObjectOfTrack: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        object: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        topDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        bottomDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        left: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        right: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 100
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
