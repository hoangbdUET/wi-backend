module.exports = function (sequelize, DataTypes) {
    return sequelize.define('task_spec', {
        idTaskSpec: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "name-group",
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
        },
        type: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        group: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: "name-group"
        }
    });
};
