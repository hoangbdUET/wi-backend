var CONFIG = {
	connect:{
		host:"localhost",
		user:"root",
		password:""
	},
	dbname:'mysqltest',
	table: [
		{
			name:'CURVE',
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
				'DESCRIPTON VARCHAR(50) NOT NULL',
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
			name:'well',
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
		}
	]
	
}
module.exports.config = CONFIG;