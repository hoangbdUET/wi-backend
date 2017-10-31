module.exports = {
  apps : [
      {
        script: "./app.js",
        watch: true,
        env_app1: {
			name: "wi_app1_3000",	
			"PORT": 3000,
            "NODE_ENV": "app1"
        },
        env_app2: {
			name: "wi_app2_3001",
            "PORT": 3001,
            "NODE_ENV": "app2"
        },
        env_app3: {
			name: "wi_app3_3002",
            "PORT": 3002,
            "NODE_ENV": "app3"
        },
        env_app4: {
			name: "wi_app4_3004",
            "PORT": 3003,
            "NODE_ENV": "app4"
        }
      }
  ]
}