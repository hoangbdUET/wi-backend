module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ternary', {
        idTernary: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        xValue: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        yValue: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        style: {
            type: DataTypes.ENUM("Circle", "Cross", "Diamond", "Plus", "Square", "Star", "Triangle"),
            allowNull: false,
            defaultValue: "Circle"
        },
        usedIn: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        show: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
