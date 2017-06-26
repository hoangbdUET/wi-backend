const CONFIG_DATABASE = {
	connect:{
		host:"localhost",
		user:"root",
		password:""
	},
	database_name:'well_insight_test',
	table: [
		{
			name:'curve_data',
			query: [
				'ID_CURVE INT AUTO_INCREMENT PRIMARY KEY',
				'NAME VARCHAR(50) NOT NULL',
				'UNIT VARCHAR(50) NOT NULL',
				'DESCRIPTON VARCHAR(50) NOT NULL',
				'VALUE VARCHAR(250) NOT NULL'
			]
		},
		{
			name: 'property',
			query: [
				'ID_PROPERTY INT AUTO_INCREMENT PRIMARY KEY',
				'ID INT NOT NULL',
				'NAME VARCHAR(50) NOT NULL',
				'UNIT VARCHAR(50) NOT NULL',
				'DESCRIPTION VARCHAR(50) NOT NULL',
				'VALUE VARCHAR(250) NOT NULL'
			]
		},
		{
			name: 'link',
			query: [
				'ID_LINK INT',
				'ID_CURVE INT',
				'PRIMARY KEY(ID_LINK, ID_CURVE)'
			]
		},
		{
			name:'well_data',
			query:[
				'ID_WELL INT AUTO_INCREMENT PRIMARY KEY',
				'STRT VARCHAR(50) NOT NULL', 
				'STOP VARCHAR(50) NOT NULL', 
				'STEP VARCHAR(50) NOT NULL',
				'SRVC1 VARCHAR(50) NOT NULL', 
				'DATEE VARCHAR(50) NOT NULL', 
				'WELL VARCHAR(50) NOT NULL', 
				'COMP VARCHAR(50) NOT NULL', 
				'FLD VARCHAR(50) NOT NULL', 
				'LOC VARCHAR(50) NOT NULL', 
				'LATI VARCHAR(50) NOT NULL', 
				'LONGG VARCHAR(50) NOT NULL', 
				'RWS VARCHAR(50) NOT NULL', 
				'WST VARCHAR(50) NOT NULL', 
				'PROV VARCHAR(50) NOT NULL',
				'SRVC2 VARCHAR(50) NOT NULL',
				'ID_LINK INT'
			]
		},
		{
			name:'project',
			query:[
				'ID_PROJECT INT AUTO_INCREMENT PRIMARY KEY',
				'NAME VARCHAR(50) NOT NULL',
				'LOCATION VARCHAR(250) NOT NULL',
				'COMPANY VARCHAR(250) NOT NULL',
				'DEPARTMENT VARCHAR(250) NOT NULL',
				'DESCRIPTION VARCHAR(250) NOT NULL'
			]
		},
        {
            name:'well',
            query:[
                'ID_WELL INT AUTO_INCREMENT PRIMARY KEY',
				'ID_PROJECT INT',
                'NAME VARCHAR(50) NOT NULL',
                'TOP_DEPTH VARCHAR(250) NOT NULL',
                'BOTTOM_DEPTH VARCHAR(250) NOT NULL',
                'STEP VARCHAR(250) NOT NULL'
            ]
        },
        {
            name:'curve',
            query:[
                'ID_CURVE INT AUTO_INCREMENT PRIMARY KEY',
                'ID_WELL INT',
                'NAME VARCHAR(50) NOT NULL',
                'DATA_SET VARCHAR(250) NOT NULL',
                'FAMILY VARCHAR(250) NOT NULL',
                'UNIT VARCHAR(250) NOT NULL',
                'INI_VALUE VARCHAR(250) NOT NULL'
            ]
        },
        {
            name:'plot',
            query:[
                'ID_PLOT INT AUTO_INCREMENT PRIMARY KEY',
                'ID_WELL INT',
				'NAME VARCHAR(50) NOT NULL',
				'OPTION VARCHAR(250) NOT NULL'
            ]
        },
        {
            name:'depth_axis',
            query:[
                'ID_DEPTH_AXIS INT AUTO_INCREMENT PRIMARY KEY',
                'ID_PLOT INT',
                'NAME VARCHAR(50) NOT NULL',
                'OPTION VARCHAR(250) NOT NULL'
            ]
        },
        {
            name:'track',
            query:[
                'ID_TRACK INT AUTO_INCREMENT PRIMARY KEY',
                'ID_PLOT INT',
                'NAME VARCHAR(50) NOT NULL',
                'OPTION VARCHAR(250) NOT NULL'
            ]
        }
	]
	
};

module.exports.CONFIG_DATABASE = CONFIG_DATABASE;