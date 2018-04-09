module.exports = function (sequelize, DataTypes) {
    return sequelize.define('cross_plot', {
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '{}',
            set(value) {
                this.setDataValue('title', typeof(value) === 'object' ? JSON.stringify(value) : value);
            },
            get() {
                const value = this.getDataValue('title');
                return JSON.parse(value);
            }
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
            defaultValue: 1000
        },
        referenceVertLineNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7
        },
        referenceDisplay: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        referenceShowDepthGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        discriminator: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isDefineDepthColors: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        axisColors: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        showHistogram: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
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
    }, {
        paranoid: true
    });
};
