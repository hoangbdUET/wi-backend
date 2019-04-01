module.exports = function (sequelize, DataTypes) {
	return sequelize.define('curve', {
		idCurve: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: "name-idDataset"
		},
		// dataset:{ // propose to remove
		//     type:DataTypes.STRING(250),
		//     allowNull:false
		// },
		unit: {
			type: DataTypes.STRING(250),
			allowNull: false,
			set(value) {
				this.setDataValue('unit', (value.trim() === "" || !value) ? "NULL" : value);
			},
		},
		description: {
			type: DataTypes.STRING(250),
			allowNull: true,
			defaultValue: ''
		},
		duplicated: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
		type: {
			type: DataTypes.ENUM("NUMBER", "TEXT", "ARRAY", "OTHER"),
			allowNull: false,
			defaultValue: "NUMBER"
		},
		dimension: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1
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
