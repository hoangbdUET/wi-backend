module.exports = function (sequelize, DataTypes) {
	return sequelize.define('ml_project', {
		idMlProject: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
			validate: {
				notEmpty: true
			}
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
		description: {
			type: DataTypes.STRING(250),
			allowNull: true
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
		charset: 'utf8',
		collate: 'utf8_general_ci'
	});
};