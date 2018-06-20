module.exports = function (sequelize, DataTypes) {
    return sequelize.define('histogram_curve_set', {
        idHistogramCurveSet:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        showGaussian: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        loga: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showGrid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showCumulative: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        flipHorizontal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        lineStyle: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: 'Custom'
        },
        lineColor: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Blue'
        },
        plot: {
            type: DataTypes.ENUM('Bar', 'Curve'),
            allowNull: 'false',
            defaultValue: 'Bar',
            validate: {
                isIn: [['Bar', 'Curve']]
            }
        },
        plotType: {
            type: DataTypes.ENUM('Frequency', 'Percent'),
            defaultValue: 'Frequency',
            validate: {
                isIn: [['Frequency', 'Percent']]
            },
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Blue'
        },
        discriminator: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // createdBy: {
        //     type: DataTypes.STRING(50),
        //     allowNull: false,
        // },
        // updatedBy: {
        //     type: DataTypes.STRING(50),
        //     allowNull: false
        // }

    })
};
