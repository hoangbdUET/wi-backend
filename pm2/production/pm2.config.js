module.exports = {
    "apps": [
        {
            "name": "5001",
            "script": "./app.js",
            "exec_mode": "fork",
            "timestamp": "MM-DD-YYYY HH:mm Z",
            "log_date_format": "MM-DD-YYYY HH:mm Z",
            "error_file": "./logs/error/5001-stderr.log",
            "out_file": "./logs/out/5001-stdout.log",
            "pid_file": "./pids/5001.pid",
            "max_memory_restart": "1G",
            "env": {
                "NODE_ENV": "prod1"
            }
        },
        {
            "name": "5002",
            "script": "./app.js",
            "exec_mode": "fork",
            "timestamp": "MM-DD-YYYY HH:mm Z",
            "log_date_format": "MM-DD-YYYY HH:mm Z",
            "error_file": "./logs/error/5002-stderr.log",
            "out_file": "./logs/out/5002-stdout.log",
            "pid_file": "./pids/5002.pid",
            "max_memory_restart": "1G",
            "env": {
                "NODE_ENV": "prod2"
            }
        }
    ]
};