#!/usr/bin/env bash
mysql -u root -pqwertyui -e "DROP DATABASE IF EXISTS wi_backend;"
mysql -u root -pqwertyui -e "CREATE DATABASE IF NOT EXISTS wi_backend;"
mkdir uploads
mkdir uploads_temp
mkdir ../data