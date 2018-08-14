module.exports = function (sequelize, DataTypes) {
    return sequelize.define('histogram_curve_set', {
        idHistogramCurveSet:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        intervalDepthTop: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        intervalDepthBottom: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        showGaussian: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        showCumulative: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        color: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Blue'
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
