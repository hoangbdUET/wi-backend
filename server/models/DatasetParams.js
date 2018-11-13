module.exports = function (sequelize, DataTypes) {
    return sequelize.define('dataset_params', {
        idDatasetParam: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        mnem: {
            type: DataTypes.STRING
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    });
};
