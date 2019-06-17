process.appMode = 'auto-model';
const SequelizeAuto = require('i2g-sequelize-auto')
const Database = require("config").Database;
const appMain = require("./app-entry.js");
const auto = new SequelizeAuto(Database.dbUser, Database.user, Database.password, {
	host: Database.host,
	dialect: Database.dialect,
	directory: './server/new-models', // prevents the program from writing to disk
	port: Database.port,
	camelCaseForFileName: true,
	additional: {
	    timestamps: true
	    //...
	},
	// tables: ['pets']
	//...
})



auto.run(function (err) {
	if (err) throw err;
	appMain();
});
