module.exports = function (sequelize, DataTypes) {
	return sequelize.define('line', {
		idLine: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		showHeader: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		showDataset: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		minValue: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0
		},//Family
		maxValue: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 200
		},//Family
		autoValueScale: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		displayMode: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: 'Line'
		},//Family
		wrapMode: {
			type: DataTypes.ENUM('None', 'Left', 'Right', 'Both'),
			allowNull: false,
			defaultValue: 'None'
		},
		blockPosition: {
			type: DataTypes.ENUM('None', 'Start', 'Middle', 'End'),
			allowNull: false,
			defaultValue: 'None'
		},//Family
		ignoreMissingValues: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		displayType: {
			type: DataTypes.ENUM('Linear', 'Logarithmic'),
			allowNull: false,
			defaultValue: 'Linear'
		},//Family
		displayAs: {
			type: DataTypes.ENUM('Normal', 'Cumulative', 'Mirror', 'Pid'),
			allowNull: false,
			defaultValue: 'Normal'
		},
		lineStyle: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "[0]"
		},//Family
		lineWidth: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 1
		},//Family
		lineColor: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "red"
		},//Family
		symbolName: {
			type: DataTypes.ENUM('Circle', 'Cross', 'Diamond', 'Dot', 'Plus', 'Square', 'Star', 'Triangle'),
			allowNull: true,
			defaultValue: 'Circle'
		},
		symbolSize: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 5
		},
		symbolLineWidth: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		symbolStrokeStyle: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "red"
		},
		symbolFillStyle: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "red"
		},
		symbolLineDash: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "[0]"
		},
		alias: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		unit: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: "N/A"
		},
		orderNum: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'a'
		},
		textDisplayType: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: 'Text'
		},
		textSize: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 14
		},
		textBackground: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: "white"
		},
		textColor: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: "black"
		},
		textVerticalAlignment: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: "Top"
		},
		textDisplayBoundary: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 1
		},
		arrayColumnCumulative: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		},
		arrayYLowerLimit: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			allowNull: false
		},
		arrayYUpperLimit: {
			type: DataTypes.FLOAT,
			defaultValue: 1,
			allowNull: false
		},
		arrayXStart: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			allowNull: false
		},
		arrayXStop: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			allowNull: false
		},
		arraySmooth: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		arrayTraceColorPalette: {
			type: DataTypes.STRING,
			defaultValue: '',
			allowNull: false
		},
		arrayMatrixStartColor: {
			type: DataTypes.STRING(100),
			defaultValue: 'black',
			allowNull: false
		},
		arrayMatrixStopColor: {
			type: DataTypes.STRING(100),
			defaultValue: 'green',
			allowNull: false
		},
		arrayDisplayAs: {
			type: DataTypes.STRING(100),
			defaultValue: 'Column',
			allowNull: false
		},
		arrayWindowSize: {
			type: DataTypes.FLOAT,
			defaultValue: 1,
			allowNull: false
		},
		arrayWindowUnit: {
			type: DataTypes.STRING(20),
			defaultValue: 'm',
			allowNull: false
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
