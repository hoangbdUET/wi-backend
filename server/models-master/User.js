module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        idUser: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "Inactive"
            // defaultValue: "Actived"
        },
        /*
        1 : Administrator
        2 : Normal Users
         */
        role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: ""
        },
        fullname: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: ""
        }
    });
};