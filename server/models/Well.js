module.exports = function (sequelize, DataTypes) {
    return sequelize.define('well', {
        idWell: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: "name-idProject"
        },
        unit: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "m"
        },
        duplicated: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
        },
        color: {
            type: DataTypes.STRING(30),
            allowNull: true,
            defaultValue: '#f3b86d'
        },
	    relatedTo: {
		    type: DataTypes.TEXT,
		    allowNull: true,
		    set(value) {
			    this.setDataValue('relatedTo', typeof(value) === 'object' ? JSON.stringify(value) : value);
		    },
		    get() {
			    const value = this.getDataValue('relatedTo');
			    return value ? JSON.parse(value) : null;
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
    }, {
        paranoid: true
    });
};
