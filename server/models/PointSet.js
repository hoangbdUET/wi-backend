module.exports = function (sequelize, DataTypes) {
    return sequelize.define('point_set', {
        idPointSet: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        scaleLeft: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleRight: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleBottom: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleTop: {
            type: DataTypes.FLOAT,
            allowNull: true
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
        scaleMin1: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleMin2: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleMin3: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleMax1: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleMax2: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        scaleMax3: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        numColor: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        numSize: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        numSymbol: {
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
        },
        zAxes: {
            type: DataTypes.ENUM("Curve", "Zone"),
            allowNull: false,
            defaultValue: "Curve",
            validate: {
                isIn: [['Curve', 'Zone']]
            }
        },
        depthType: {
            type: DataTypes.STRING(30),
            defaultValue: "intervalDepth",
            allowNull: true
        },

        // referenceTopDepth: {
        //     type: DataTypes.DOUBLE,
        //     allowNull: false,
        //     defaultValue: 0
        // },
        // referenceBottomDepth: {
        //     type: DataTypes.DOUBLE,
        //     allowNull: false,
        //     defaultValue: 0
        // },
        // referenceScale: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     defaultValue: 1
        // },
        // referenceVertLineNumber: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     defaultValue: 1
        // },
        // referenceDisplay: {
        //     type: DataTypes.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: false
        // },
        // referenceShowDepthGrid: {
        //     type: DataTypes.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: false
        // },
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
