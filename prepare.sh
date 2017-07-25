#!/usr/bin/env bash
mysql -u root -ptanlm -e "DROP DATABASE IF EXISTS wi_backend;"
mysql -u root -ptanlm -e "CREATE DATABASE wi_backend;"