module.exports = function (sequelize, DataTypes) {
    return sequelize.define('dataset', {
        idDataset: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idWell"
        },
        datasetKey: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        datasetLabel: {
            type: DataTypes.STRING(250),
            allowNull: true
        }
    }, {
        paranoid: true
    });
};
