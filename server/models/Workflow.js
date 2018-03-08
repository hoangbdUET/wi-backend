module.exports = function (sequelize, DataTypes) {
    return sequelize.define('workflow', {
        idWorkflow: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'name'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
            set(value) {
                this.setDataValue('content', typeof(value) === 'object' ? JSON.stringify(value) : value);
            },
            get() {
                const value = this.getDataValue('content');
                return JSON.parse(value);
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });
};
