module.exports = function (sequelize, DataTypes) {
    return sequelize.define('reference_curve', {
        idReferenceCurve: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        left: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        right: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        visiable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        log: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        color: {
            type: DataTypes.STRING(250),
            allowNull: false,
            defaultValue: 'rgb(0,0,0)'
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