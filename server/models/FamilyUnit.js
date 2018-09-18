function convertEquation(input) {
    if (input[0] === 1) {
        return "K" + input[1];
    } else if (input[0] === 2) {
        return "PA" + input[1];
    } else {
        return input[1];
    }
}

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('family_unit', {
        idUnit: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        rate: {
            type: DataTypes.STRING(100),
            allowNull: false,
            // get() {
            //     const value = this.getDataValue('rate');
            //     try {
            //         return convertEquation(JSON.parse(value));
            //     } catch (e) {
            //         console.log("ERR", value);
            //     }
            // }
        }
    });
};
