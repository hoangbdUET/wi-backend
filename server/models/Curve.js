module.exports = function (sequelize, DataTypes) {
    return sequelize.define('curve', {
        idCurve: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idDataset"
        },
        // dataset:{ // propose to remove
        //     type:DataTypes.STRING(250),
        //     allowNull:false
        // },
        unit: {
            type: DataTypes.STRING(250),
            allowNull: false,
            set(value) {
                this.setDataValue('unit', (value.trim() === "" || !value) ? "NULL" : value);
            },
        },
        description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
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
