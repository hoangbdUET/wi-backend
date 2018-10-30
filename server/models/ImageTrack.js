module.exports = function (sequelize, DataTypes) {
    return sequelize.define('image_track', {
        idImageTrack: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        showTitle: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'Image Track 1'
        },
        topJustification: {
            type: DataTypes.ENUM('Left', 'Center', 'Right'),
            allowNull: false,
            defaultValue: 'Center'
        },
        orderNum: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: 'zz'
        },
        background: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'white'
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1
        },
        widthUnit: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: "inch"
        },
        zoomFactor: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1.0
        },
        trackOffset: {
            type: DataTypes.FLOAT,
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
