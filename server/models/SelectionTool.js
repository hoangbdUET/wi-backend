module.exports = function (sequelize, DataTypes) {
    return sequelize.define('selection_tool', {
        idSelectionTool: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: false,
            set(value) {
                this.setDataValue('data', typeof(value) === 'object' ? JSON.stringify(value) : value);
            },
            get() {
                const value = this.getDataValue('data');
                return JSON.parse(value);
            }
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
