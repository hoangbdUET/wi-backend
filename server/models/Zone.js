module.exports = function (sequelize, DataTypes) {
    return sequelize.define('zone', {
        idZone: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        startDepth: {
            type: DataTypes.FLOAT(15, 4),
            allowNull: false
        },
        endDepth: {
            type: DataTypes.FLOAT(15, 4),
            allowNull: false
        },
        // fill: {
        //     type: DataTypes.TEXT,
        //     allowNull: false,
        //     set(value) {
        //         this.setDataValue('fill', typeof(value) === 'object' ? JSON.stringify(value) : value);
        //     },
        //     get() {
        //         const value = this.getDataValue('fill');
        //         return JSON.parse(value);
        //     }
        // },
        showName: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        // name: {
        //     type: DataTypes.STRING(100),
        //     allowNull: false//TODO: has defaultValue????
        // },
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
