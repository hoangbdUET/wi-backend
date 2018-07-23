const Influx = require('influx');
const config = require('config');
const influx = new Influx.InfluxDB({
    host: config.influx.host,
    port: config.influx.port,
    username: config.influx.username,
    password: config.influx.password,
    database: config.influx.database,
    schema: [
        {
            measurement: 'response_times',
            tags: ['username'],
            fields: {
                duration: Influx.FieldType.INTEGER,
                path: Influx.FieldType.STRING
            }
        }
    ]
});
influx.getDatabaseNames()
    .then(names => {
        if (!names.includes(config.influx.database)) {
            return influx.createDatabase(config.influx.database);
        }
    });

module.exports = influx;