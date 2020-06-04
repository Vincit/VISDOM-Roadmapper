#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER "roadmapper-su" SUPERUSER PASSWORD 'roadmapper-su';
    CREATE DATABASE "roadmapper-test-db";
    GRANT ALL PRIVILEGES ON DATABASE "roadmapper-test-db" TO "roadmapper-su";
EOSQL
