module.exports = function (sequelize, DataTypes) {
    return sequelize.define('parameter_set', {
        idParameterSet: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: 'name-idProject-type'
        },
        content: {
            type: DataTypes.TEXT('medium'),
            allowNull: true,
            set(value) {
                this.setDataValue('content', typeof(value) === 'object' ? JSON.stringify(value) : value);
            },
            get() {
                const value = this.getDataValue('content');
                return JSON.parse(value);
            }
        },
        type: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: 'TASK',
	        unique: 'name-idProject-type'
        },
	    note: {
		    type: DataTypes.STRING(255),
		    allowNull: true,
		    defaultValue: ''
	    },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        updatedBy: {
            type: DataTypes.STRING(50),
            allowNull: false
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
    });
};