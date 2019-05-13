module.exports = function (sequelize, DataTypes) {
    return sequelize.define('marker_set', {
        idMarkerSet: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: 'name-idWell'
        },
        duplicated: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
	    note: {
		    type: DataTypes.STRING(255),
		    allowNull: true,
            defaultValue: ''
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
        lockable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
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