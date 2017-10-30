#!/usr/bin/env bash
mysql -u root -pqwertyui -e "DROP DATABASE IF EXISTS wi_backend;"
DBS="$(mysql -u root -pqwertyui -Bse "show databases like 'wi_%'")"
for db in $DBS; do
echo "===================>>>>>>>>>>>Deleting $db"
mysql -u root -pqwertyui -Bse "drop database $db"
done
mysql -u root -pqwertyui -e "CREATE DATABASE IF NOT EXISTS wi_backend;"
rm -rf /opt/data && mkdir /opt/data
rm -rf /opt/wi-backend/uploads && mkdir /opt/wi-backend/uploads
rm -rf /opt/wi-backend/wi-images && mkdir /opt/wi-backend/wi-images
