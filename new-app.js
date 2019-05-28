process.appMode = 'auto-model';
const SequelizeAuto = require('sequelize-auto')
const Database = require("config").Database;
const appMain = require("./app-entry.js");
const auto = new SequelizeAuto(Database.dbUser, Database.user, Database.password, {
	host: Database.host,
	dialect: Database.dialect,
	directory: './test-models', // prevents the program from writing to disk
	port: Database.port,
	camelCase: true,
	additional: {
	    timestamps: false
	    //...
	},
	// tables: ['pets']
	//...
})



auto.run(function (err) {
	if (err) throw err;
	appMain();
});
