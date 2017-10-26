module.exports = function (sequelize, DataTypes) {
    return sequelize.define('image_of_track', {
        idImageOfTrack: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
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
        }
    });
};
