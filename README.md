# WI-backend
***
	Backend of Well Insight Project
## Get started
### Process Environments
+  BACKEND_PORT: "3000"
+  BACKEND_DBNAME: "wi_backend"
+  BACKEND_DBUSER: "revotech"
+  BACKEND_DBPASSWORD: "123456"
+  SALT: "wi-salt"
+  VALIDATION_REQUEST_STATUS: "false"
+  BACKEND_DBHOST: "mariadb"
+  BACKEND_DBDIALECT: "mysql"
+  THUMBNAIL_SERVICE: "http://wi-thumbnail-svc:8080"
+  PUBLIC_ADDRESS: "http://wi-backend-svc:3000"
+  BACKEND_DBPORT: "3306"
+  BACKEND_DBPREFIX: "wi0000_"
+  BACKEND_DBSTORAGE: "/tmp/a.sqlite"
+  BACKEND_REDIS_HOST: "wi-redis-svc"
+  BACKEND_REDIS_PORT: "6379"
+  BACKEND_CSV_SERVICE: "http://wi-csv-transform-svc:8000"
+  BACKEND_INV_SERVICE: "http://wi-inventory-svc:9000"
+  BACKEND_AUTH_SERVICE: "http://wi-authenticate-svc:2999"
+  BACKEND_CURVE_BASE_PATH: "/app/data/curve"
+  BACKEND_IMAGE_BASE_PATH: "/app/data/image"
+  BACKEND_EXPORT_PATH: "/app/data/export"
+  BACKEND_USER_LOG_PATH: "/app/data/user-log"
+  BACKEND_USER_UPLOAD_PATH: "/app/data/uploads"
+  BACKEND_JWTKEY: "secretKey"
+  BACKEND_MQTT_BROKER: "wss://mqtt-broker.i2g.cloud"