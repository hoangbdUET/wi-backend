module.exports = function (sequelize, DataTypes) {
    return sequelize.define('depth_axis', {
        idDepthAxis: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
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
            defaultValue: 'Depth'
        },
        idPlot: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        justification: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'center'
        },
        depthType: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        unitType: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'M'
        },
        decimals: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        trackBackground: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'rgba(255,255,255,0)'
        },
        geometryWidth: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.6
        },
        orderNum: {
            type: DataTypes.STRING(200),
            allowNull: false,
            defaultValue: 'zz'
        },
        width: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.5
        },
        widthUnit: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: "inch"
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
