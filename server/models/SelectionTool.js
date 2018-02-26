module.exports = function (sequelize, DataTypes) {
    return sequelize.define('selection_point', {
        idSelectionPoint: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Points: {
            type: DataTypes.TEXT,
            allowNull: false,

        },
        set(value) {
            this.setDataValue('Points', typeof(value) === 'object' ? JSON.stringify(value) : value);
        },
        get() {
            const value = this.getDataValue('Points');
            return JSON.parse(value);
        }
    });
};
