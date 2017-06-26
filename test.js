let knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'mysqltest'
    }
});

const CONFIG_DATABASE = require('./server/models/database/create-database.config.js').CONFIG_DATABASE;
let create = require('./server/models/database/create-database.js');
let mysql = require('mysql');
let conn = mysql.createConnection(CONFIG_DATABASE.connect);
create.createDatabaseAndTable(conn, function (err, conn) {
    if(err) console.log(err);
    let query = knex.select().from('well');
    conn.query(query, function (err, result) {
        if(err) return console.log(err);
        console.log('result: ', result);
    });
});
/*let query = knex('well').insert({
    idProject: "123",
    type: "well"
}).returning('*').toString();*/
