module.exports = function (sequelize, DataTypes) {
    return sequelize.define('image_of_track', {
        idImageOfTrack: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fill: {
            type: DataTypes.STRING,
            allowNull: true
        },
        showName: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        imageUrl: {
            type: DataTypes.STRING,
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
        smartDisplay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
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
