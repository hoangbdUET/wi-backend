module.exports = function (sequelize, DataTypes) {
    return sequelize.define('shading', {
        idShading: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        leftFixedValue: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        rightFixedValue: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        negativeFill: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fill: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        positiveFill: {
            type: DataTypes.TEXT,
            allowNull: true //truoc la false
        },
        isNegPosFill: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        orderNum: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'a'
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
