module.exports = function (sequelize, DataTypes) {
    return sequelize.define('crossplot', {
        idCrossPlot: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "BlankCrossPlot",
            unique: "name-idWell"
        },

        referenceTopDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceBottomDepth: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        referenceScale: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        referenceVertLineNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        referenceDisplay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        referenceShowDepthGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};
