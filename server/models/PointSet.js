module.exports = function (sequelize, DataTypes) {
    return sequelize.define('pointset', {
        idPointSet: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        scaleLeft: {
            type: DataTypes.FLOAT,
            allowNullL: true
        },
        scaleRight: {
            type: DataTypes.FLOAT,
            allowNullL: true
        },
        scaleBottom: {
            type: DataTypes.FLOAT,
            allowNullL: true
        },
        scaleTop: {
            type: DataTypes.FLOAT,
            allowNullL: true
        },
        logX: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        logY: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        majorX: {
            type: DataTypes.INTEGER,
            allowNull: true//TODO has default???:9
        },
        minorX: {
            type: DataTypes.INTEGER,
            allowNull: true//TODO has default???:9
        },
        majorY: {
            type: DataTypes.INTEGER,
            allowNull: true//TODO has default???:9
        },
        minorY: {
            type: DataTypes.INTEGER,
            allowNull: true//TODO has default???:9
        },
        scaleMin: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        scaleMax: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        numColor: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        pointSymbol: {
            type: DataTypes.STRING(60),
            allowNull: false,
            defaultValue: 'circle'
        },
        pointSize: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5
        },
        pointColor: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'blue'
        },
        overlayLine: {
            type: DataTypes.STRING(180),
            allowNull: false,
            defaultValue: 'AnaDrill CDN 6.5in Den/Neu Rhof 1.0'
        },
        standalone: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showLine: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        lineMode: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true//true is horizontal, false is vertical
        },
        // TODO : Add zoneset, ...
        intervalDepthTop: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        intervalDepthBottom: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        activeZone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "All"
        }
    });
};
