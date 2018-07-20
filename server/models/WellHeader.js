module.exports = function (sequelize, DataTypes) {
    return sequelize.define('well_header', {
        idWellHeader: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        idWell: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        header: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        standard: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
};
